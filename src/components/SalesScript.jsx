export default function SalesScript({ script }) {
  const sentences = script
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  return (
    <section className="script-box hyper-card">
      <div className="ai-panel-head">
        <div>
          <span className="ai-panel-eyebrow">SALES SCRIPT</span>
          <h2>HyperCLOVA X</h2>
        </div>
        <span className="model-status hyper">LOCAL AI</span>
      </div>

      <div className="script-surface">
        <span className="script-label">현장 상담 스크립트</span>
        <div className="script-lines">
          {sentences.map((sentence, index) => (
            <p
              key={`${sentence}-${index}`}
              className="script-line"
              style={{ "--line-delay": `${index * 90}ms` }}
            >
              {sentence}
            </p>
          ))}
        </div>
      </div>

      <div className="script-notice">
        <span>!</span>
        확인되지 않은 가격·혜택·설치 상태는 스크립트에 포함하지 않습니다.
      </div>
    </section>
  );
}
