import express from "express";
import Event from "../models/Event.js";
import TicketClick from "../models/TicketClick.js";

const router = express.Router();

router.get("/events", async (req, res, next) => {
  try {
    const {
      city = "Sydney",
      status,
      search,
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { city };
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: "inactive" };
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { venueName: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    if (from || to) {
      query.dateTime = {};
      if (from) query.dateTime.$gte = new Date(from);
      if (to) query.dateTime.$lte = new Date(to);
    }

    const events = await Event.find(query)
      .sort({ dateTime: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.post("/tickets", async (req, res, next) => {
  try {
    const { email, consent, eventId } = req.body;
    if (!email || consent !== true || !eventId) {
      return res.status(400).json({ message: "Email, consent, and eventId required" });
    }

    const ticket = await TicketClick.create({ email, consent, eventId });
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

export default router;
