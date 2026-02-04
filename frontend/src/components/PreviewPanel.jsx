const PreviewPanel = ({ event }) => {
  if (!event) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-sm text-ink/60">
          Select an event to preview details.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <p className="text-xs uppercase tracking-[0.25em] text-sea/60">
        Preview
      </p>

      <h3 className="mt-2 text-2xl font-display font-semibold leading-snug text-ink">
        {event.title}
      </h3>

      <p className="mt-2 text-sm text-ink/70">
        {new Date(event.dateTime).toLocaleString()}
      </p>

      <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink/70">
        <p>
          <span className="font-semibold text-ink">Venue:</span>{" "}
          {event.venueName || "Sydney"}
        </p>
        <p>
          <span className="font-semibold text-ink">Address:</span>{" "}
          {event.venueAddress || "-"}
        </p>
        <p>
          <span className="font-semibold text-ink">Summary:</span>{" "}
          {event.shortSummary || event.description}
        </p>
        <p>
          <span className="font-semibold text-ink">Source:</span>{" "}
          {event.sourceName}
        </p>
      </div>

      <a
        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sea transition-colors hover:text-sea/80"
        href={event.sourceUrl}
        target="_blank"
        rel="noreferrer"
      >
        Open original
      </a>
    </div>
  );
};

export default PreviewPanel;
