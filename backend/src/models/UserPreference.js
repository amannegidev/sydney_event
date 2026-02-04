import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, unique: true },
    state: { type: String, default: "idle" },
    preferences: {
      genre: { type: String, default: "" },
      budget: { type: String, default: "" },
      dateTime: { type: String, default: "" },
      location: { type: String, default: "" },
      crowd: { type: String, default: "" },
    },
    lastNotifiedAt: { type: Date },
  },
  { timestamps: true }
);

const UserPreference = mongoose.model("UserPreference", preferenceSchema);

export default UserPreference;
