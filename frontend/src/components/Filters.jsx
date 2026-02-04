const Filters = ({ filters, onChange }) => (
  <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-soft lg:grid-cols-4">
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/60">
        City
      </label>
      <input
        value={filters.city}
        onChange={(event) =>
          onChange({ ...filters, city: event.target.value })
        }
        className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
        placeholder="Sydney"
      />
    </div>

    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/60">
        Keyword
      </label>
      <input
        value={filters.search}
        onChange={(event) =>
          onChange({ ...filters, search: event.target.value })
        }
        className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
        placeholder="Jazz, startup, festival"
      />
    </div>

    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/60">
        From
      </label>
      <input
        type="date"
        value={filters.from}
        onChange={(event) =>
          onChange({ ...filters, from: event.target.value })
        }
        className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
      />
    </div>

    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/60">
        To
      </label>
      <input
        type="date"
        value={filters.to}
        onChange={(event) =>
          onChange({ ...filters, to: event.target.value })
        }
        className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
      />
    </div>
  </div>
);

export default Filters;
