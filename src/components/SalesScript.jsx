export default function SalesScript({ script }) {
  return (
    <section className="script-box">
      <div className="recommendation-label">HyperCLOVA X · 상담 스크립트</div>
      <h2>현장 상담 준비</h2>
      <blockquote>{script}</blockquote>
      <div className="script-notice">
        확인되지 않은 가격·혜택·설치 상태는 스크립트에 포함하지 않습니다.
      </div>
    </section>
  );
}
