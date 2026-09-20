export default function ApiSourceCard({ resultCount }) {
  return (
    <aside className="api-source-card">
      <div className="source-head">
        <div className="source-icon">공공</div>
        <div><span>DATA SOURCE</span><strong>행정안전부 LOCALDATA</strong></div>
        <i className="live-dot" />
      </div>
      <h3>식품_일반음식점 데이터 조회</h3>
      <dl>
        <div><dt>Endpoint</dt><dd>/info</dd></div>
        <div><dt>기본 상태</dt><dd>영업/정상</dd></div>
        <div><dt>현행화</dt><dd>매일 갱신 · D-2 기준</dd></div>
        <div><dt>일일 한도</dt><dd>10,000건</dd></div>
      </dl>
      <div className="source-result">
        <span>현재 PoC 수집 결과</span>
        <strong>{resultCount}건</strong>
      </div>
      <p>실제 연동에서는 브라우저가 OpenAPI를 직접 호출하지 않고 n8n이 조회·페이지네이션·정규화를 수행합니다.</p>
    </aside>
  );
}
