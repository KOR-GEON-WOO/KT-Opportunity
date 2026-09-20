export default function LoadingStep({
  title,
  detail,
  stages,
  stageIndex = 0,
  itemIndex,
  itemTotal,
  itemName,
}) {
  const hasItems = Number.isInteger(itemIndex) && Number(itemTotal) > 0;

  const progress = hasItems
    ? (
        (itemIndex * stages.length + Math.min(stageIndex + 1, stages.length)) /
        (itemTotal * stages.length)
      ) * 100
    : ((Math.min(stageIndex + 1, stages.length)) / stages.length) * 100;

  return (
    <section className="loading-workspace page-enter" aria-live="polite">
      <div className="loading-brand">
        <img
          src="/assets/kt-wordmark-white.png"
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="loading-copy">
        <span className="loading-eyebrow">AGENT PROCESSING · DEMO MODE</span>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>

      {hasItems && (
        <div className="loading-candidate">
          <div>
            <span>후보 {itemIndex + 1} / {itemTotal}</span>
            <strong>{itemName}</strong>
          </div>
          <strong>{Math.round(progress)}%</strong>
        </div>
      )}

      <div className="processing-list">
        {stages.map((stage, index) => {
          const state =
            index < stageIndex
              ? "done"
              : index === stageIndex
                ? "active"
                : "waiting";

          return (
            <div
              key={stage}
              className={`processing-stage ${state}`}
              style={{ "--stage-delay": `${index * 100}ms` }}
            >
              <span className="stage-marker">
                {state === "done" ? "✓" : state === "active" ? <i /> : null}
              </span>
              <span>{stage}</span>
              <small>
                {state === "done"
                  ? "완료"
                  : state === "active"
                    ? "처리 중"
                    : "대기"}
              </small>
            </div>
          );
        })}
      </div>

      <div className="loading-track" aria-hidden="true">
        <span style={{ width: `${Math.max(8, Math.min(progress, 100))}%` }} />
      </div>
    </section>
  );
}
