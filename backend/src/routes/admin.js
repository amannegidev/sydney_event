import express from "express";
import Event from "../models/Event.js";
import ensureAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/events", ensureAuth, async (req, res, next) => {
  try {
    const {
      city = "Sydney",
      status,
      search,
      from,
      to,
      page = 1,
      limit = 50,
    } = req.query;

    const query = { city };
    if (status) {
      query.status = status;
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
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.post("/events/:id/import", ensureAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { importNotes = "" } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "imported";
    event.importedAt = new Date();
    event.importedBy = req.user?.id;
    event.importNotes = importNotes;

    await event.save();

    res.json(event);
  } catch (error) {
    next(error);
  }
});

export default router;
