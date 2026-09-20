export default function ErrorState({
  title,
  message,
  kind = "error",
  onRetry,
  onBack,
}) {
  return (
    <section className={`error-state ${kind} page-enter`} role="alert">
      <div className="error-icon">{kind === "empty" ? "0" : "!"}</div>
      <div className="error-copy">
        <span>{kind === "empty" ? "NO RESULT" : "ERROR"}</span>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <div className="error-actions">
        {onBack && (
          <button className="secondary-button" type="button" onClick={onBack}>
            조건 수정
          </button>
        )}
        {onRetry && (
          <button className="primary-button" type="button" onClick={onRetry}>
            {kind === "empty" ? "다시 검색" : "다시 시도"}
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </section>
  );
}
