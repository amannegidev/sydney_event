import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const configurePassport = ({
  googleClientId,
  googleClientSecret,
  googleCallbackUrl,
}) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const existing = await User.findOne({ googleId: profile.id });
          if (existing) {
            return done(null, existing);
          }

          const user = await User.create({
            googleId: profile.id,
            name: profile.displayName || "Admin",
            email: profile.emails?.[0]?.value || `${profile.id}@google-oauth.local`,
          });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default configurePassport;
