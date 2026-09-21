export default function StatusBadge({ tone = 'neutral', children }) {
  return <span className={`status-badge ${tone}`}><span className="status-badge-dot" aria-hidden="true" />{children}</span>;
}
