import "dotenv/config";
import connectDb from "../config/db.js";
import Event from "../models/Event.js";

const sampleEvents = [
  {
    title: "Sydney Harbour Sunset Cruise",
    description: "An evening cruise with live music and skyline views.",
    shortSummary: "Sunset cruise with live jazz and canapés.",
    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    venueName: "Circular Quay",
    venueAddress: "Circular Quay Wharf 6, Sydney",
    city: "Sydney",
    category: ["Music", "Cruise"],
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    sourceName: "Sample",
    sourceUrl: "https://example.com/sydney-harbour-cruise",
    status: "new",
    lastScrapedAt: new Date(),
  },
  {
    title: "Tech Founders Meetup",
    description: "Networking and lightning talks for startup founders.",
    shortSummary: "Sydney founders meetup with pitch sessions.",
    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    venueName: "Fishburners",
    venueAddress: "11 York St, Sydney",
    city: "Sydney",
    category: ["Startup", "Networking"],
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    sourceName: "Sample",
    sourceUrl: "https://example.com/tech-founders-meetup",
    status: "updated",
    lastScrapedAt: new Date(),
  },
  {
    title: "Art in The Park",
    description: "Outdoor art installations and local food stalls.",
    shortSummary: "Family-friendly art festival in the park.",
    dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    venueName: "Hyde Park",
    venueAddress: "Elizabeth St, Sydney",
    city: "Sydney",
    category: ["Art", "Festival"],
    imageUrl: "https://images.unsplash.com/photo-1473187983305-f615310e7daa",
    sourceName: "Sample",
    sourceUrl: "https://example.com/art-in-the-park",
    status: "new",
    lastScrapedAt: new Date(),
  },
];

const run = async () => {
  try {
    await connectDb(process.env.MONGODB_URI);
    await Event.insertMany(sampleEvents, { ordered: false });
    console.log("Seeded sample events");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed", error);
    process.exit(1);
  }
};

run();
