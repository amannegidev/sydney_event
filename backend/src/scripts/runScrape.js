import "dotenv/config";
import connectDb from "../config/db.js";
import runScrapeJob from "../services/scrapeService.js";

const run = async () => {
  try {
    await connectDb(process.env.MONGODB_URI);
    const result = await runScrapeJob();
    console.log("Scrape finished", result);
    process.exit(0);
  } catch (error) {
    console.error("Scrape failed", error);
    process.exit(1);
  }
};

run();
