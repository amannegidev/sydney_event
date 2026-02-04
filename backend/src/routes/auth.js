import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failed" }),
  (req, res) => {
    console.log("✅ Callback hit - authenticated user:", req.user);
    console.log("✅ Session ID:", req.sessionID);
    console.log("✅ Session data:", req.session);
    
    // ✅ Save session before redirecting to ensure cookie is set
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        return res.redirect(process.env.CLIENT_URL + "?error=session");
      }
      console.log("✅ Session saved, redirecting to:", process.env.CLIENT_URL);
      res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
    });
  }
);

router.get("/me", (req, res) => {
  console.log("🔍 /auth/me - isAuthenticated:", req.isAuthenticated?.());
  console.log("🔍 /auth/me - req.user:", req.user);
  console.log("🔍 /auth/me - sessionID:", req.sessionID);
  
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json(req.user);
  }
  return res.status(401).json({ message: "Unauthorized" });
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    // ✅ Save session after logout
    req.session.save(() => {
      res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
    });
  });
});

router.get("/failed", (_req, res) => {
  res.status(401).json({ message: "Authentication failed" });
});

export default router;
