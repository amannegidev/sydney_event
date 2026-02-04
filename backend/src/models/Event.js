import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    shortSummary: { type: String, default: "" },
    dateTime: { type: Date, required: true },
    venueName: { type: String, default: "" },
    venueAddress: { type: String, default: "" },
    city: { type: String, default: "Sydney" },
    category: { type: [String], default: [] },
    imageUrl: { type: String, default: "" },
    sourceName: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "updated", "inactive", "imported"],
      default: "new",
    },
    lastScrapedAt: { type: Date, default: Date.now },
    importedAt: { type: Date },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    importNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

eventSchema.index({ sourceUrl: 1 }, { unique: true });
eventSchema.index({ title: 1, dateTime: 1, venueName: 1 });

eventSchema.set("toJSON", { virtuals: true });

const Event = mongoose.model("Event", eventSchema);

export default Event;
