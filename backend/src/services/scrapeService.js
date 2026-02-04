import Event from "../models/Event.js";
import scrapeAllSources from "../scrapers/index.js";
import { parseDateFromText } from "../utils/date.js";
import { getEventStatus, isInactive } from "../utils/status.js";

const INACTIVE_AFTER_DAYS = 7;

const resolveExistingEvent = async (incoming) => {
  if (incoming.sourceUrl) {
    const byUrl = await Event.findOne({ sourceUrl: incoming.sourceUrl });
    if (byUrl) {
      return byUrl;
    }
  }

  return Event.findOne({
    title: incoming.title,
    dateTime: incoming.dateTime,
    venueName: incoming.venueName,
  });
};

const normalizeEvent = (raw) => {
  const dateTime = raw.dateTime || parseDateFromText(raw.dateText) || new Date();

  return {
    title: raw.title,
    description: raw.description || "",
    shortSummary: raw.shortSummary || raw.description || "",
    dateTime,
    venueName: raw.venueName || "",
    venueAddress: raw.venueAddress || "",
    city: raw.city || "Sydney",
    category: raw.category || [],
    imageUrl: raw.imageUrl || "",
    sourceName: raw.sourceName,
    sourceUrl: raw.sourceUrl,
  };
};

const upsertEvent = async (rawEvent, now) => {
  const incoming = normalizeEvent(rawEvent);
  const existing = await resolveExistingEvent(incoming);
  const nextStatus = getEventStatus({ existingEvent: existing, incomingEvent: incoming });

  if (!existing) {
    return Event.create({
      ...incoming,
      status: nextStatus,
      lastScrapedAt: now,
    });
  }

  existing.set({
    ...incoming,
    status: existing.status === "imported" ? "imported" : nextStatus,
    lastScrapedAt: now,
  });

  return existing.save();
};

const markInactiveEvents = async ({ seenIds, now }) => {
  const candidates = await Event.find({ _id: { $nin: Array.from(seenIds) } });

  const updates = candidates.map(async (event) => {
    if (event.status === "imported") {
      return event;
    }

    if (isInactive({
      eventDate: event.dateTime,
      lastSeenAt: event.lastScrapedAt,
      now,
      inactiveAfterDays: INACTIVE_AFTER_DAYS,
    })) {
      event.status = "inactive";
      return event.save();
    }

    return event;
  });

  await Promise.all(updates);
};

const runScrapeJob = async () => {
  const now = new Date();
  const scrapedEvents = await scrapeAllSources();

  const seenIds = new Set();
  const savedEvents = [];
  for (const rawEvent of scrapedEvents) {
    const saved = await upsertEvent(rawEvent, now);
    seenIds.add(saved.id);
    savedEvents.push(saved);
  }

  await markInactiveEvents({ seenIds, now });

  return { total: scrapedEvents.length, processed: seenIds.size, savedEvents };
};

export default runScrapeJob;
