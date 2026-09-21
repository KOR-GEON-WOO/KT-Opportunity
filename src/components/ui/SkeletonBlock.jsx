export default function SkeletonBlock({ rows = 3, compact = false, label = '콘텐츠를 불러오는 중' }) {
  return (
    <div className={`skeleton-block ${compact ? 'compact' : ''}`} role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="skeleton-line skeleton-title" aria-hidden="true" />
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton-line" aria-hidden="true" key={index} />
      ))}
    </div>
  );
}
