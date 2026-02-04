import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import EventCard from "../components/EventCard.jsx";
import TicketModal from "../components/TicketModal.jsx";
import { fetchEvents } from "../lib/api.js";

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data } = await fetchEvents({ city: "Sydney" });
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
   <Layout>
  <section className="rounded-3xl bg-ink px-8 py-12 text-white shadow-soft">
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.25em] text-white/60">
        Sydney, Australia
      </p>

      <h2 className="mt-3 text-4xl font-display font-semibold leading-tight">
        Discover what&apos;s on this week
      </h2>

      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
        Curated from trusted public sources and refreshed every few hours.
      </p>
    </div>
  </section>

  <section className="mt-12 grid gap-6 lg:grid-cols-3">
    {loading && (
      <div className="col-span-full rounded-xl bg-white/60 px-4 py-6 text-center text-sm text-ink/60">
        Loading events…
      </div>
    )}

    {!loading && events.length === 0 && (
      <div className="col-span-full rounded-2xl bg-white px-6 py-10 text-center text-sm text-ink/60 shadow-soft">
        No events found. Please check back soon.
      </div>
    )}

    {events.map((event) => (
      <EventCard
        key={event.id || event._id}
        event={event}
        onTicket={setActiveEvent}
      />
    ))}
  </section>

  {activeEvent && (
    <TicketModal
      event={activeEvent}
      onClose={() => setActiveEvent(null)}
    />
  )}
</Layout>

  );
};

export default HomePage;
