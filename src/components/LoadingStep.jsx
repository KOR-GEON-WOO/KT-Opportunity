export default function LoadingStep({ title, detail, stages, stageIndex = 0 }) {
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

      <div className="processing-list">
        {stages.map((stage, index) => {
          const state =
            index < stageIndex ? "done" : index === stageIndex ? "active" : "waiting";

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
                {state === "done" ? "완료" : state === "active" ? "처리 중" : "대기"}
              </small>
            </div>
          );
        })}
      </div>

      <div className="loading-track" aria-hidden="true">
        <span
          style={{
            width: `${Math.max(12, ((stageIndex + 1) / stages.length) * 100)}%`,
          }}
        />
      </div>
    </section>
  );
}
