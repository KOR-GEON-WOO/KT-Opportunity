import {
  actualOpenStatusLabels,
  contractStatusLabels,
  installStatusLabels,
} from "../data/mockData";
import { formatNumber } from "../utils/format";

function Segmented({ value, options, labels, onChange }) {
  return <div className="segmented">{options.map((option) => <button key={option} type="button" className={value === option ? "active" : ""} onClick={() => onChange(option)}>{labels[option]}</button>)}</div>;
}

export default function StoreVerification({ store, value, onChange, onBack, onNext }) {
  const update = (key, next) => onChange({ ...value, [key]: next });
  const productRows = [
    ["인터넷", "internetStatus", true], ["Wi-Fi", "wifiStatus", false], ["POS", "posStatus", false], ["CCTV", "cctvStatus", false],
  ];

  return (
    <section className="verification-layout">
      <article className="store-profile-card">
        <span className="section-code">F-02 · SELECTED STORE</span>
        <h2>{store.storeName}</h2><p>{store.roadAddress || store.lotAddress}</p>
        <div className="store-profile-grid">
          <div><span>인허가일</span><strong>{store.permitDate}</strong></div>
          <div><span>업태</span><strong>{store.businessType || "-"}</strong></div>
          <div><span>소재지면적</span><strong>{formatNumber(store.area, "㎡")}</strong></div>
          <div><span>시설총규모</span><strong>{formatNumber(store.facilitySize, "㎡")}</strong></div>
          <div><span>다중이용업소</span><strong>{store.multiUseBusinessYn || "-"}</strong></div>
          <div><span>전화번호</span><strong>{store.phone || "미등록"}</strong></div>
        </div>
        <div className="store-id-box"><span>STORE ID</span><code>{store.storeId}</code></div>
      </article>

      <article className="verification-form-card">
        <div className="panel-title"><div><span className="section-code">F-02</span><h2>직원 확인 정보</h2><p>Agent는 개업·계약·설치 상태를 추정하지 않습니다.</p></div><span className="human-chip">HUMAN VERIFIED</span></div>

        <div className="verify-block"><div className="verify-label"><strong>실제 개업 상태 *</strong><small>OPEN / PREPARING / CLOSED / UNKNOWN</small></div><Segmented value={value.actualOpenStatus} options={["OPEN","PREPARING","CLOSED","UNKNOWN"]} labels={actualOpenStatusLabels} onChange={(v) => update("actualOpenStatus", v)} /></div>
        <div className="verify-block"><div className="verify-label"><strong>KT 인터넷 설치 상태 *</strong><small>설치 가능 여부는 직원이 내부 기준으로 확인</small></div><Segmented value={value.installStatus} options={["PASS","FAIL","UNKNOWN"]} labels={installStatusLabels} onChange={(v) => update("installStatus", v)} /></div>

        <div className="contract-matrix">
          <div className="matrix-head"><span>상품군</span><span>계약 상태</span></div>
          {productRows.map(([label, key, required]) => (
            <div className="matrix-row" key={key}>
              <div><strong>{label}</strong><small>{required ? "필수 확인" : "선택 확인"}</small></div>
              <Segmented value={value[key]} options={["CONTRACTED","UNDECIDED","NOT_REQUIRED","UNKNOWN"]} labels={contractStatusLabels} onChange={(v) => update(key, v)} />
            </div>
          ))}
        </div>

        <div className="verification-meta">
          <label><span>확인일 *</span><input type="date" value={value.checkedAt} onChange={(e) => update("checkedAt", e.target.value)} /></label>
          <label><span>확인 메모</span><textarea rows="3" value={value.checkNote} onChange={(e) => update("checkNote", e.target.value)} placeholder="추가 확인사항 또는 특이사항" /></label>
        </div>

        <div className="human-warning"><span>!</span><p>확인하지 않은 항목은 <strong>UNKNOWN</strong>으로 유지합니다. 실제 개업 여부나 기존 계약 상태를 Agent가 임의로 채우지 않습니다.</p></div>
        <div className="action-row"><button className="secondary-button" onClick={onBack}>후보 목록</button><button className="primary-button" onClick={onNext}>규칙 기반 상품 분석 <span>→</span></button></div>
      </article>
    </section>
  );
}
