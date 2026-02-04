import clsx from "clsx";

const statusStyles = {
  new: "bg-accent/10 text-accent",
  updated: "bg-sea/10 text-sea",
  inactive: "bg-ink/10 text-ink/70",
  imported: "bg-emerald-100 text-emerald-700",
};

const StatusTag = ({ status }) => (
  <span
    className={clsx(
      "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
      statusStyles[status] || "bg-ink/10 text-ink/70"
    )}
  >
    {status}
  </span>
);

export default StatusTag;
