const defaultStages = [
  "영업 조건 해석",
  "지역명 표준화",
  "건축HUB 조회",
  "후보 건물 필터링",
];

export default function LoadingStep({
  title,
  detail,
  stages = defaultStages,
}) {
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
        <span className="loading-eyebrow">AGENT PROCESSING</span>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>

      <div className="processing-list">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className={index === 0 ? "processing-stage active" : "processing-stage"}
            style={{ "--stage-delay": `${index * 160}ms` }}
          >
            <span className="stage-marker">
              {index === 0 ? <i /> : null}
            </span>
            <span>{stage}</span>
            <small>{index === 0 ? "처리 중" : "대기"}</small>
          </div>
        ))}
      </div>

      <div className="loading-track" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
