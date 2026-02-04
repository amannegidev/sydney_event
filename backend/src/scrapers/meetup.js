import axios from "axios";
import { load } from "cheerio";

const MEETUP_URL = "https://www.meetup.com/find/?location=au--sydney&source=EVENTS";

const parseMeetup = ($, element) => {
  const title = $(element).find("h3").first().text().trim();
  const dateText = $(element).find("time").first().text().trim();
  const venue = $(element).find(".venueDisplay").text().trim();
  const url = $(element).find("a").first().attr("href");
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
          category: data.eventType ? [data.eventType] : [],
          imageUrl: data.image || "",
          sourceName: "Meetup",
          sourceUrl: data.url || "",
        });
      });
    } catch (_error) {
      return;
    }
  });

  return events;
};

const scrapeMeetup = async () => {
  const { data } = await axios.get(MEETUP_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = load(data);
  const events = extractJsonLdEvents($);

  if (events.length) {
    return events;
  }

  const fallbackEvents = [];

  $("li.searchResultsItem").each((_, element) => {
    const parsed = parseMeetup($, element);
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
        sourceName: "Meetup",
        sourceUrl: parsed.sourceUrl,
      });
    }
  });

  return fallbackEvents;
};

export default scrapeMeetup;
