import axios from "axios";
import { load } from "cheerio";

const EVENTBRITE_URL =
  "https://www.eventbrite.com/d/australia--sydney/events/";

const parseEventbrite = ($, element) => {
  const title = $(element).find(".eds-event-card-content__title").text().trim();
  const dateText = $(element)
    .find(".eds-event-card-content__sub-title")
    .first()
    .text()
    .trim();
  const venue = $(element)
    .find(".eds-event-card-content__sub-title")
    .last()
    .text()
    .trim();
  const url = $(element).find("a.eds-event-card-content__action-link").attr("href");
  const imageUrl = $(element).find("img").attr("src") || "";

  return {
    title,
    dateText,
    venue,
    sourceUrl: url ? url.split("?")[0] : "",
    imageUrl,
  };
};
const extractJsonLdEvents = ($) => {
  const events = [];
  const scripts = $("script[type='application/ld+json']");

  scripts.each((_, script) => {
    try {
      const json = JSON.parse($(script).contents().text());
      const itemList = Array.isArray(json)
        ? json.find((item) => item["@type"] === "ItemList")
        : json;

      const items = itemList?.itemListElement || itemList?.["@graph"] || [];
      items.forEach((item) => {
        const data = item.item || item;
        if (!data?.url || !data?.name) return;

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
          category: [],
          imageUrl: data.image || "",
          sourceName: "Eventbrite",
          sourceUrl: data.url,
        });
      });
    } catch (_error) {
      return;
    }
  });

  return events;
};

const scrapeEventbrite = async () => {
  const { data } = await axios.get(EVENTBRITE_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = load(data);
  const events = extractJsonLdEvents($);

  if (events.length) {
    return events;
  }

  const fallbackEvents = [];

  $(".eds-event-card-content__content").each((_, element) => {
    const parsed = parseEventbrite($, element);
    if (parsed.title && parsed.sourceUrl) {
      fallbackEvents.push({
        title: parsed.title,
        description: "",
        shortSummary: "",
        dateText: parsed.dateText,
        venueName: parsed.venue,
        venueAddress: "",
        city: "Sydney",
        category: [],
        imageUrl: parsed.imageUrl,
        sourceName: "Eventbrite",
        sourceUrl: parsed.sourceUrl,
      });
    }
  });

  return fallbackEvents;
};

export default scrapeEventbrite;
