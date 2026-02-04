import { useState } from "react";
import { createTicketClick } from "../lib/api.js";

const TicketModal = ({ event, onClose }) => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (eventClick) => {
    eventClick.preventDefault();
    if (!email || !consent) {
      setError("Email and consent are required.");
      return;
    }

    try {
      setSubmitting(true);
      await createTicketClick({ email, consent, eventId: event.id || event._id });
      window.location.href = event.sourceUrl;
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sea/60">
              Get tickets
            </p>
            <h2 className="mt-1 text-xl font-display font-semibold text-ink">
              {event.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-sea transition-colors hover:text-ink"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-ink">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(eventInput) => setEmail(eventInput.target.value)}
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>

          <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/70">
            <input
              type="checkbox"
              checked={consent}
              onChange={(eventInput) => setConsent(eventInput.target.checked)}
              className="mt-1 rounded border-ink/20"
            />
            I agree to receive email updates related to events.
          </label>

          {error && (
            <p className="text-sm font-medium text-accent">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sea focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Continue to tickets"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
