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
    
    // Simply redirect - Passport handles session automatically
    const redirectUrl = process.env.CLIENT_URL || "http://localhost:5173";
    console.log("✅ Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
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
