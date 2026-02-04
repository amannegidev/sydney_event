import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import Event from "../models/Event.js";

const getEmbeddings = () =>
  new OllamaEmbeddings({
    model: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  });

const getChatModel = () =>
  new ChatOllama({
    model: process.env.OLLAMA_MODEL || "llama3",
    temperature: 0.3,
    baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  });

const buildEventText = (event) =>
  [
    event.title,
    event.shortSummary || event.description,
    event.venueName,
    event.city,
    event.category?.join(", "),
    event.dateTime ? new Date(event.dateTime).toLocaleString() : "",
  ]
    .filter(Boolean)
    .join(" | ");

const buildPreferenceQuery = (preferences) =>
  [
    preferences.genre,
    preferences.budget,
    preferences.dateTime,
    preferences.location,
    preferences.crowd,
  ]
    .filter(Boolean)
    .join(" ");

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);

const buildVectorStore = async (events) => {
  const documents = events.map(
    (event) =>
      new Document({
        pageContent: buildEventText(event),
        metadata: {
          id: event.id,
          title: event.title,
          sourceUrl: event.sourceUrl,
          venue: event.venueName,
          dateTime: event.dateTime,
          sourceName: event.sourceName,
        },
      })
  );

  const store = await MemoryVectorStore.fromDocuments(documents, getEmbeddings());
  return store;
};

export const recommendEvents = async ({ preferences, limit = 3, events }) => {
  const query = buildPreferenceQuery(preferences);
  if (!query) {
    return [];
  }

  console.log("recommendEvents: starting", { limit });
  const sourceEvents = events
    ? events
    : await withTimeout(
        Event.find({ status: { $ne: "inactive" } }).limit(200).lean(),
        15000,
        "fetchEvents"
      );
  if (!sourceEvents.length) {
    return [];
  }

  console.log("recommendEvents: building vector store", {
    count: sourceEvents.length,
  });
  try {
    const store = await withTimeout(
      buildVectorStore(sourceEvents),
      8000,
      "buildVectorStore"
    );
    console.log("recommendEvents: running similarity search", { limit });
    const results = await withTimeout(
      store.similaritySearch(query, limit),
      30000,
      "similaritySearch"
    );

    return results.map((result) => result.metadata);
  } catch (error) {
    console.error("recommendEvents: vector search failed, using fallback", error);
    const normalizedQuery = query.toLowerCase();
    const keywordMatches = sourceEvents
      .filter((event) =>
        buildEventText(event).toLowerCase().includes(normalizedQuery)
      )
      .slice(0, limit);
    const fallback = keywordMatches.length
      ? keywordMatches
      : [...sourceEvents]
          .sort(
            (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
          )
          .slice(0, limit);
    return fallback.map((event) => ({
      id: event.id,
      title: event.title,
      sourceUrl: event.sourceUrl,
      venue: event.venueName,
      dateTime: event.dateTime,
      sourceName: event.sourceName,
    }));
  }
};

export const formatRecommendations = async ({ preferences, recommendations }) => {
  const llm = getChatModel();
  const preferenceText = buildPreferenceQuery(preferences) || "no specific preferences";
  const summary = recommendations
    .map(
      (event, index) =>
        `${index + 1}. ${event.title}\n   When: ${new Date(
          event.dateTime
        ).toLocaleString()}\n   Where: ${event.venue || "TBA"}\n   Source: ${event.sourceName}\n   Link: ${event.sourceUrl}`
    )
    .join("\n\n");

  const prompt = `You are an events assistant for Sydney.\nUser preferences: ${preferenceText}.\nRewrite the events list below as a concise response. Keep the numbering and include the links:\n${summary}`;

  try {
    const response = await withTimeout(
      llm.invoke(prompt),
      15000,
      "formatRecommendations"
    );
    return response.content;
  } catch (error) {
    console.error("formatRecommendations failed, using fallback", error);
    return summary || "No matching events found. Try /prefs to update your preferences.";
  }
};
