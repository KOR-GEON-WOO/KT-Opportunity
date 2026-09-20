export default function LoadingStep({ title, detail, stages, stageIndex = 0 }) {
  const progress = Math.min(100, ((stageIndex + 1) / stages.length) * 100);
  return (
    <section className="loading-screen" aria-live="polite">
      <div className="loading-topline"><span>AGENT PROCESSING</span><strong>{Math.round(progress)}%</strong></div>
      <h2>{title}</h2>
      <p>{detail}</p>
      <div className="loading-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="loading-stages">
        {stages.map((stage, index) => (
          <div key={stage} className={index < stageIndex ? "loading-stage done" : index === stageIndex ? "loading-stage active" : "loading-stage"}>
            <span>{index < stageIndex ? "✓" : index + 1}</span>
            <strong>{stage}</strong>
            <small>{index < stageIndex ? "완료" : index === stageIndex ? "처리 중" : "대기"}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
