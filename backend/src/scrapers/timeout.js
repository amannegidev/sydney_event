import axios from "axios";
import { load } from "cheerio";

const TIMEOUT_URL = "https://www.timeout.com/sydney/things-to-do";

const parseTimeout = ($, element) => {
  const title = $(element).find("h3").text().trim();
  const summary = $(element).find("p").first().text().trim();
  const url = $(element).find("a").attr("href");
  const imageUrl = $(element).find("img").attr("data-src") || "";

  return {
    title,
    summary,
    sourceUrl: url ? `https://www.timeout.com${url}` : "",
    imageUrl,
  };
};
const extractJsonLdEvents = ($) => {
  const events = [];
  const scripts = $("script[type='application/ld+json']");

  scripts.each((_, script) => {
    try {
      const json = JSON.parse($(script).contents().text());
      const items = Array.isArray(json) ? json : [json];
      items.forEach((data) => {
        if (data?.["@type"] !== "Event") return;
        const location = data.location || {};
        const address = location.address || {};
        events.push({
          title: data.name,
          description: data.description || "",
          shortSummary: data.description || "",
          dateTime: data.startDate ? new Date(data.startDate) : null,
          venueName: location.name || "",
          venueAddress: address.streetAddress || "",
          city: address.addressLocality || "Sydney",
          category: data.eventType ? [data.eventType] : ["Things to do"],
          imageUrl: data.image || "",
          sourceName: "TimeOut",
          sourceUrl: data.url || "",
        });
      });
    } catch (_error) {
      return;
    }
  });

  return events;
};

const scrapeTimeOut = async () => {
  const { data } = await axios.get(TIMEOUT_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = load(data);
  const events = extractJsonLdEvents($);

  if (events.length) {
    return events;
  }

  const fallbackEvents = [];

  $(".tileContent").each((_, element) => {
    const parsed = parseTimeout($, element);
    if (parsed.title && parsed.sourceUrl) {
      fallbackEvents.push({
        title: parsed.title,
        description: parsed.summary,
        shortSummary: parsed.summary,
        dateText: "",
        venueName: "",
        venueAddress: "",
        city: "Sydney",
        category: ["Things to do"],
        imageUrl: parsed.imageUrl,
        sourceName: "TimeOut",
        sourceUrl: parsed.sourceUrl,
      });
    }
  });

  return fallbackEvents;
};

export default scrapeTimeOut;
