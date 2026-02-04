import scrapeEventbrite from "./eventbrite.js";
import scrapeMeetup from "./meetup.js";
import scrapeTimeOut from "./timeout.js";

const scrapeAllSources = async () => {
  const results = await Promise.allSettled([
    scrapeEventbrite(),
    scrapeMeetup(),
    scrapeTimeOut(),
  ]);

  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
};

export default scrapeAllSources;
