import { Link } from "react-router-dom";

const Layout = ({ children }) => (
  <div className="min-h-screen bg-fog text-ink">
    <header className="px-6 py-6 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-sea/70">
            Sydney Events
          </p>
          <h1 className="text-2xl font-display font-semibold">Aggregator Platform</h1>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="text-sea hover:text-ink transition" to="/">
            Events
          </Link>
          <Link className="text-sea hover:text-ink transition" to="/admin">
            Admin
          </Link>
        </nav>
      </div>
    </header>
    <main className="px-6 pb-16 lg:px-12">{children}</main>
  </div>
);

export default Layout;
