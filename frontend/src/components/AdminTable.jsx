import StatusTag from "./StatusTag.jsx";

const AdminTable = ({ events, onSelect, onImport }) => (
  <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
    <table className="w-full border-collapse text-left text-sm">
      <thead className="bg-blush text-xs uppercase tracking-wide text-ink/60">
        <tr>
          <th className="px-5 py-4 font-semibold">Event</th>
          <th className="px-5 py-4 font-semibold">Date</th>
          <th className="px-5 py-4 font-semibold">Venue</th>
          <th className="px-5 py-4 font-semibold">Status</th>
          <th className="px-5 py-4 font-semibold">Action</th>
        </tr>
      </thead>

      <tbody>
        {events.map((event) => (
          <tr
            key={event.id || event._id}
            onClick={() => onSelect(event)}
            className="cursor-pointer border-t border-ink/5 transition-colors hover:bg-fog"
          >
            <td className="px-5 py-4 font-medium text-ink">
              {event.title}
            </td>

            <td className="px-5 py-4 text-ink/70">
              {new Date(event.dateTime).toLocaleDateString()}
            </td>

            <td className="px-5 py-4 text-ink/70">
              {event.venueName || "Sydney"}
            </td>

            <td className="px-5 py-4">
              <StatusTag status={event.status} />
            </td>

            <td className="px-5 py-4">
              <button
                type="button"
                onClick={(eventClick) => {
                  eventClick.stopPropagation();
                  onImport(event);
                }}
                className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              >
                Import
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminTable;
