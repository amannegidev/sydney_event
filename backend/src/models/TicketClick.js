import mongoose from "mongoose";

const ticketClickSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    consent: { type: Boolean, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const TicketClick = mongoose.model("TicketClick", ticketClickSchema);

export default TicketClick;
