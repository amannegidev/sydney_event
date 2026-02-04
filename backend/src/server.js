import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cron from "node-cron";

import connectDb from "./config/db.js";
import configurePassport from "./config/passport.js";
import runScrapeJob from "./services/scrapeService.js";
import { startBot, notifyUsers } from "./services/botService.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const bot = startBot({ token: process.env.TELEGRAM_BOT_TOKEN });

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
// Session (ensure saveUninitialized true so session cookie is created)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - SessionID: ${req.sessionID}`);
  next();
});

configurePassport({
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/auth", authRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const start = async () => {
  await connectDb(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const initial = await runScrapeJob();
  await notifyUsers({ events: initial.savedEvents, bot });
  cron.schedule("0 */6 * * *", async () => {
    try {
      const result = await runScrapeJob();
      await notifyUsers({ events: result.savedEvents, bot });
    } catch (error) {
      console.error("Scrape job failed", error);
    }
  });
};

start();
