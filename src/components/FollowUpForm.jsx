import { useMemo, useState } from "react";
import { categoryLabels } from "../data/mockData";

const leadStatuses = ["DISCOVERED","VERIFIED","READY","CONTACTED","FOLLOW_UP","CONVERTED","CLOSED"];
const consultationStatuses = ["NOT_STARTED","SCHEDULED","IN_PROGRESS","COMPLETED","CANCELLED"];
const resultStatuses = ["","SUCCESS","FOLLOW_UP","FAIL"];
const products = ["INTERNET","WIFI","POS","CCTV"];

export default function FollowUpForm({ store, proposal, saveResult, onSave, onBack, onNewSearch }) {
  const [form, setForm] = useState({
    leadStatus: "READY",
    consultationStatus: "NOT_STARTED",
    consultationResult: "",
    interestProducts: proposal?.products?.map((p) => p.productCategory) ?? [],
    followUpDate: "",
    notes: "",
    saveApproved: false,
  });
  const [saving, setSaving] = useState(false);

  const recommended = useMemo(() => proposal?.products?.map((p) => p.productCode) ?? [], [proposal]);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleProduct = (product) => update("interestProducts", form.interestProducts.includes(product) ? form.interestProducts.filter((item) => item !== product) : [...form.interestProducts, product]);
  const save = async () => { setSaving(true); await onSave(form); setSaving(false); };

  return (
    <section className="followup-layout">
      <article className="followup-context">
        <span className="section-code">F-05 · STORE STATUS</span><h2>{store.storeName}</h2><p>{store.roadAddress}</p>
        <div className="recommended-codes"><span>추천 상품코드</span>{recommended.length ? recommended.map((code) => <code key={code}>{code}</code>) : <small>추천 상품 없음</small>}</div>
        <div className="history-policy"><strong>저장 정책</strong><p>매장 현황은 storeId 기준 갱신, 상담 이력은 storeId + updatedAt 조합으로 별도 누적합니다.</p></div>
      </article>

      <article className="followup-form-card">
        <div className="panel-title"><div><span className="section-code">CONSULTATION LOG</span><h2>상담 결과 및 후속관리</h2><p>최초 저장은 직원이 saveApproved=true로 승인한 경우에만 수행합니다.</p></div><span className="human-chip">FINAL HUMAN GATE</span></div>
        <div className="followup-grid">
          <label><span>영업 Lead 상태 *</span><select value={form.leadStatus} onChange={(e) => update("leadStatus", e.target.value)}>{leadStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>상담 상태 *</span><select value={form.consultationStatus} onChange={(e) => update("consultationStatus", e.target.value)}>{consultationStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>상담 결과</span><select value={form.consultationResult} onChange={(e) => update("consultationResult", e.target.value)}>{resultStatuses.map((item) => <option key={item} value={item}>{item || "미입력"}</option>)}</select></label>
          <label><span>후속 상담일</span><input type="date" value={form.followUpDate} onChange={(e) => update("followUpDate", e.target.value)} /></label>
        </div>
        <div className="interest-block"><span>관심 상품</span><div>{products.map((product) => <button type="button" key={product} className={form.interestProducts.includes(product) ? "active" : ""} onClick={() => toggleProduct(product)}>{categoryLabels[product]}</button>)}</div></div>
        <label className="notes-field"><span>상담 메모</span><textarea rows="5" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="업무에 필요한 최소 정보만 기록하세요. 불필요한 개인정보는 입력하지 않습니다." /></label>
        <label className={form.saveApproved ? "approval-check active" : "approval-check"}><input type="checkbox" checked={form.saveApproved} onChange={(e) => update("saveApproved", e.target.checked)} /><span>✓</span><div><strong>저장 내용을 최종 검토했으며 저장을 승인합니다.</strong><small>saveApproved=true · 승인 시각과 updatedAt은 KST ISO 8601 형식으로 기록</small></div></label>

        {saveResult && <div className="save-success"><span>✓</span><div><strong>상담 및 후속관리 정보가 저장되었습니다.</strong><p>{saveResult.savedAt}</p></div></div>}
        <div className="action-row">{saveResult ? <><button className="secondary-button" onClick={onBack}>AI 상담안 보기</button><button className="primary-button" onClick={onNewSearch}>새 음식점 찾기 <span>→</span></button></> : <><button className="secondary-button" onClick={onBack}>AI 상담안 보기</button><button className="primary-button" disabled={!form.saveApproved || saving} onClick={save}>{saving ? "저장 중..." : "승인 및 저장"} {!saving && <span>→</span>}</button></>}</div>
      </article>
    </section>
  );
}
