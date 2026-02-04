import StatusTag from "./StatusTag.jsx";

const EventCard = ({ event, onTicket }) => (
  <article className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-soft transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.25em] text-sea/60">
          {event.sourceName}
        </p>
        <h3 className="mt-2 text-xl font-display font-semibold leading-snug text-ink">
          {event.title}
        </h3>
      </div>
      <StatusTag status={event.status} />
    </div>

    <div className="grid gap-2 text-sm leading-relaxed text-ink/70">
      <p>
        <span className="font-semibold text-ink">When:</span>{" "}
        {new Date(event.dateTime).toLocaleString()}
      </p>
      <p>
        <span className="font-semibold text-ink">Where:</span>{" "}
        {event.venueName || "Sydney"}
      </p>
      <p className="line-clamp-3">
        {event.shortSummary || event.description}
      </p>
    </div>

    <div className="flex items-center justify-between pt-3">
      <button
        type="button"
        onClick={() => onTicket(event)}
        className="rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        Get tickets
      </button>

      <a
        href={event.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xs font-semibold uppercase tracking-wide text-sea transition-colors hover:text-sea/80"
      >
        View source
      </a>
    </div>
  </article>
);

export default EventCard;
