import { businessTypeOptions, regionOptions } from "../data/mockData";

export default function RestaurantSearchForm({ value, onChange, onInterpret, onSearch }) {
  const update = (key, next) => onChange({ ...value, [key]: next });
  const changeRegion1 = (next) => {
    onChange({
      ...value,
      regionLevel1: next,
      regionLevel2: regionOptions[next]?.[0] ?? "",
    });
  };

  return (
    <section className="search-console">
      <div className="console-head">
        <div><span className="section-code">F-01</span><h2>최근 인허가 음식점 찾기</h2><p>지역과 인허가 기간을 기준으로 영업/정상 매장을 조회합니다.</p></div>
        <span className="rule-chip">인허가일 최신순</span>
      </div>

      <div className="natural-query">
        <div className="ai-badge">AI</div>
        <input
          value={value.naturalQuery}
          onChange={(e) => update("naturalQuery", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onInterpret();
            }
          }}
          placeholder="예: 충남 천안시에서 최근 개업한 일식 음식점을 찾아줘"
          aria-label="자연어 검색 조건"
        />
        <button type="button" onClick={onInterpret}>조건 해석</button>
      </div>

      <div className="search-grid">
        <label><span>상위 지역 *</span><select value={value.regionLevel1} onChange={(e) => changeRegion1(e.target.value)}>{Object.keys(regionOptions).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>하위 지역 *</span><select value={value.regionLevel2} onChange={(e) => update("regionLevel2", e.target.value)}>{(regionOptions[value.regionLevel1] ?? []).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>인허가 시작일 *</span><input type="date" value={value.permitDateFrom} onChange={(e) => update("permitDateFrom", e.target.value)} /></label>
        <label><span>인허가 종료일 *</span><input type="date" value={value.permitDateTo} onChange={(e) => update("permitDateTo", e.target.value)} /></label>
        <label><span>업태</span><select value={value.businessType} onChange={(e) => update("businessType", e.target.value)}>{businessTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>영업 상태</span><select value={value.businessStatus} onChange={(e) => update("businessStatus", e.target.value)}><option>영업/정상</option></select></label>
        <label className="span-2"><span>사업장명 검색</span><input value={value.storeNameKeyword} onChange={(e) => update("storeNameKeyword", e.target.value)} placeholder="사업장명 부분 일치" /></label>
      </div>

      <div className="console-actions">
        <div><span className="green-dot" />필수 검색값 확인 후 OpenAPI 조회</div>
        <button className="primary-button" type="button" onClick={onSearch}>일반음식점 조회 <span>→</span></button>
      </div>
    </section>
  );
}
