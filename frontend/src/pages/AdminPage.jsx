import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import Filters from "../components/Filters.jsx";
import AdminTable from "../components/AdminTable.jsx";
import PreviewPanel from "../components/PreviewPanel.jsx";
import { fetchAdminEvents, importEvent, fetchMe } from "../lib/api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminPage = () => {
  const [filters, setFilters] = useState({
    city: "Sydney",
    search: "",
    from: "",
    to: "",
  });
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(null);

  const loadEvents = async () => {
    try {
      const { data } = await fetchAdminEvents(filters);
      setEvents(data);
      if (data.length && !selected) {
        setSelected(data[0]);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        setAuthError("Please sign in with Google to access the dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    await importEvent(event.id || event._id, {
      importNotes: "Imported via dashboard",
    });
    await loadEvents();
  };

  const handleLogout = () => {
    window.location.href = `${API_URL}/auth/logout`;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await fetchMe();
        setUser(data);
        await loadEvents();
      } catch (_error) {
        setAuthError("Please sign in with Google to access the dashboard.");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!authError) {
      setLoading(true);
      loadEvents();
    }
  }, [filters]);

  const filteredEvents = useMemo(() => events, [events]);

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-sea/60">
            Admin Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-display font-semibold text-ink">
            Event Review
          </h2>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-ink">
              {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              Logout
            </button>
          </div>
        ) : (
          <a
            href={`${API_URL}/auth/google`}
            className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            Sign in with Google
          </a>
        )}
      </div>

      <div className="mt-8">
        <Filters filters={filters} onChange={setFilters} />
      </div>

      {authError && (
        <div className="mt-6 rounded-2xl bg-accent/10 p-4 text-sm font-medium text-accent">
          {authError}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[2.1fr,1fr]">
        <div>
          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-sm text-ink/60 shadow-soft">
              Loading dashboard events…
            </div>
          ) : (
            <AdminTable
              events={filteredEvents}
              onSelect={setSelected}
              onImport={handleImport}
            />
          )}
        </div>

        <PreviewPanel event={selected} />
      </div>
    </Layout>
  );
};

export default AdminPage;
