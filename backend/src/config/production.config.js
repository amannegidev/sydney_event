/**
 * Production-Ready CORS & Session Configuration
 * Copy this pattern to any MERN app
 */

// ============================================
// 1. CORS Configuration
// ============================================
const getCorsConfig = () => {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // Development: allow localhost
    return {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };
  }

  // Production: strict origin matching
  if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL environment variable is required in production");
  }

  return {
    origin: process.env.CLIENT_URL, // No trailing slash!
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 3600, // Cache preflight 1 hour
  };
};

// ============================================
// 2. Session Cookie Configuration
// ============================================
const getSessionCookieConfig = () => {
  const isDev = process.env.NODE_ENV !== "production";

  return {
    httpOnly: true, // Never expose to JS
    secure: !isDev, // HTTPS in production, HTTP in dev
    sameSite: isDev ? "lax" : "none", // "none" required for cross-domain
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    domain: isDev ? undefined : process.env.COOKIE_DOMAIN, // Optional: set domain explicitly
  };
};

// ============================================
// 3. Complete Express App Setup
// ============================================
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors(getCorsConfig()));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions with MongoDB store (persists across restarts)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600, // Lazy session update
    }),
    cookie: getSessionCookieConfig(),
  })
);

// ============================================
// 4. OAuth Callback Handler (Passport)
// ============================================
app.get("/auth/google/callback", passport.authenticate("google"), (req, res) => {
  // ✅ Session automatically created by express-session
  // ✅ Cookie automatically set with getSessionCookieConfig()
  
  // Redirect back to frontend with authenticated session
  const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${redirectUrl}/dashboard`);
});

// ============================================
// 5. Protected Route Example
// ============================================
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.get("/api/profile", requireAuth, (req, res) => {
  res.json(req.user);
});

// ============================================
// 6. Frontend Implementation
// ============================================
/*
// frontend/src/lib/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // ✅ CRITICAL: sends cookies with requests
});

// frontend/src/components/LoginButton.jsx
const handleGoogleLogin = () => {
  // ✅ CRITICAL: Full page redirect, not fetch
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
};

// All subsequent requests include session cookie automatically
export const fetchProfile = () => api.get("/api/profile");
*/

// ============================================
// 7. Environment Variables Template
// ============================================
/*
# backend/.env

# Basic
NODE_ENV=production
PORT=5000

# Frontend URL (CRITICAL: no trailing slash)
CLIENT_URL=https://sydney-event.vercel.app

# Session
SESSION_SECRET=generate_random_string_here_min_32_chars

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://sydney-event.onrender.com/auth/google/callback

# Optional: Cookie domain (only if using subdomains)
COOKIE_DOMAIN=.sydney-event.com
*/

export { getCorsConfig, getSessionCookieConfig };
