export default function LoadingOverlay({ value }) {
  if (!value) return null;
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-spinner" />
        <div className="loading-copy">
          <strong>{value.title}</strong>
          <p>{value.detail}</p>
        </div>
        <div className="loading-stages">
          {value.stages?.map((stage, index) => (
            <div key={stage} className={index < value.stageIndex ? 'done' : index === value.stageIndex ? 'active' : ''}>
              <span>{index < value.stageIndex ? '✓' : index + 1}</span>
              <p>{stage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
