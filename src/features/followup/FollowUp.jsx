import { useEffect, useMemo, useState } from 'react';
import { useAgent } from '../../app/AgentProvider.jsx';
import { categoryLabels } from '../../data/mockData.js';
import { clearFollowUpDraft, loadFollowUpDraft, saveFollowUpDraft } from '../../utils/storage.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Icon from '../../components/ui/Icon.jsx';

const LEAD_LABELS = {
  DISCOVERED: '발굴', VERIFIED: '검증 완료', READY: '상담 준비', CONTACTED: '접촉 완료', FOLLOW_UP: '후속 상담', CONVERTED: '전환', CLOSED: '종료',
};
const CONSULT_LABELS = {
  NOT_STARTED: '상담 전', SCHEDULED: '일정 확정', IN_PROGRESS: '상담 중', COMPLETED: '상담 완료', CANCELLED: '취소',
};
const RESULT_LABELS = { SUCCESS: '성공', FOLLOW_UP: '후속 필요', FAIL: '실패' };
const PRODUCTS = ['INTERNET', 'WIFI', 'POS', 'CCTV'];

function createInitialDraft(storeId, proposal) {
  const saved = loadFollowUpDraft(storeId);
  if (saved) return saved;
  return {
    leadStatus: 'READY',
    consultationStatus: 'NOT_STARTED',
    consultationResult: '',
    interestProducts: proposal?.products?.map((p) => p.productCategory) ?? [],
    followUpDate: '',
    notes: '',
    saveApproved: false,
  };
}

export default function FollowUp({ onNavigate }) {
  const { selectedStore, proposal, saveResult, saveFollowUp, error, startNewSearch } = useAgent();
  const [form, setForm] = useState(() => createInitialDraft(selectedStore?.storeId, proposal));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(createInitialDraft(selectedStore?.storeId, proposal));
  }, [selectedStore?.storeId]);

  useEffect(() => {
    if (selectedStore?.storeId && !saveResult) saveFollowUpDraft(selectedStore.storeId, form);
  }, [selectedStore?.storeId, form, saveResult]);

  const recommendedCodes = useMemo(() => proposal?.products?.map((p) => p.productCode) ?? [], [proposal]);

  if (!selectedStore) {
    return <div className="page-stack"><section className="panel"><EmptyState title="선택된 음식점이 없습니다" description="신규 음식점에서 매장을 선택한 뒤 상담 결과를 기록해 주세요." action={<button type="button" className="button primary" onClick={() => onNavigate('discovery')}>신규 음식점으로 이동</button>} /></section></div>;
  }

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleProduct = (product) => update('interestProducts', form.interestProducts.includes(product) ? form.interestProducts.filter((item) => item !== product) : [...form.interestProducts, product]);

  const save = async () => {
    setSaving(true);
    const result = await saveFollowUp(form);
    setSaving(false);
    if (result) clearFollowUpDraft(selectedStore.storeId);
  };

  if (saveResult?.payload) {
    const payload = saveResult.payload;
    return (
      <div className="page-stack followup-page">
        <section className="panel save-complete-panel">
          <span className="save-complete-icon"><Icon name="check" size={28} /></span>
          <div><span className="eyebrow">SAVED</span><h2>상담 기록을 저장했습니다.</h2><p>{selectedStore.storeName}의 상담 이력은 기존 기록을 덮어쓰지 않고 새 항목으로 누적됩니다.</p></div>
        </section>
        <section className="panel readonly-summary">
          <div className="panel-heading"><div><span className="eyebrow">CONSULTATION SUMMARY</span><h3>저장된 내용</h3></div><StatusBadge tone="success">저장 완료</StatusBadge></div>
          <dl className="summary-grid">
            <div><dt>Lead 상태</dt><dd>{LEAD_LABELS[payload.leadStatus] || payload.leadStatus}</dd></div>
            <div><dt>상담 상태</dt><dd>{CONSULT_LABELS[payload.consultationStatus] || payload.consultationStatus}</dd></div>
            <div><dt>상담 결과</dt><dd>{RESULT_LABELS[payload.consultationResult] || '미입력'}</dd></div>
            <div><dt>후속 상담일</dt><dd>{payload.followUpDate || '-'}</dd></div>
            <div className="wide"><dt>관심 상품</dt><dd>{payload.interestProducts.length ? payload.interestProducts.map((item) => categoryLabels[item]).join(', ') : '-'}</dd></div>
            <div className="wide"><dt>메모</dt><dd>{payload.notes || '-'}</dd></div>
          </dl>
          <div className="action-row-v6"><button type="button" className="button subtle" onClick={() => onNavigate('history')}>상담 이력 보기</button><button type="button" className="button primary" onClick={() => { startNewSearch(); onNavigate('discovery'); }}>새 음식점 찾기 <Icon name="arrow" size={18} /></button></div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack followup-page">
      {error && <div className="global-error" role="alert">{error}</div>}
      <section className="store-context-strip panel">
        <div><span className="eyebrow">CURRENT STORE</span><h2>{selectedStore.storeName}</h2><p>{selectedStore.roadAddress}</p></div>
        <div className="recommended-code-list">{recommendedCodes.map((code) => <code key={code}>{code}</code>)}</div>
      </section>

      <section className="followup-grid-v6">
        <article className="panel followup-form-panel">
          <div className="panel-heading"><div><span className="eyebrow">CONSULTATION LOG</span><h3>상담 결과 기록</h3><p>작성 중인 내용은 이 브라우저 세션에 자동 임시저장됩니다.</p></div></div>
          <div className="form-grid-2">
            <label><span>Lead 상태</span><select value={form.leadStatus} onChange={(e) => update('leadStatus', e.target.value)}>{Object.entries(LEAD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>상담 상태</span><select value={form.consultationStatus} onChange={(e) => update('consultationStatus', e.target.value)}>{Object.entries(CONSULT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>상담 결과</span><select value={form.consultationResult} onChange={(e) => update('consultationResult', e.target.value)}><option value="">미입력</option>{Object.entries(RESULT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>후속 상담일</span><input type="date" value={form.followUpDate} onChange={(e) => update('followUpDate', e.target.value)} /></label>
          </div>
          <div className="interest-selector"><span>관심 상품</span><div>{PRODUCTS.map((product) => <button type="button" key={product} className={form.interestProducts.includes(product) ? 'active' : ''} onClick={() => toggleProduct(product)}>{categoryLabels[product]}</button>)}</div></div>
          <label className="note-field"><span>상담 메모</span><textarea rows="6" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="업무에 필요한 최소 정보만 기록하세요. 불필요한 개인정보는 입력하지 않습니다." /></label>
          <label className={form.saveApproved ? 'approval-box active' : 'approval-box'}><input type="checkbox" checked={form.saveApproved} onChange={(e) => update('saveApproved', e.target.checked)} /><span className="approval-checkmark">✓</span><div><strong>저장 내용을 최종 확인했습니다.</strong><p>승인 후 상담 이력에 새 기록으로 누적합니다.</p></div></label>
          <div className="action-row-v6"><button type="button" className="button subtle" onClick={() => onNavigate(proposal ? 'proposal' : 'discovery')}>이전 화면</button><button type="button" className="button primary" disabled={!form.saveApproved || saving} onClick={save}>{saving ? '저장 중...' : '승인 및 저장'} {!saving && <Icon name="arrow" size={18} />}</button></div>
        </article>

        <aside className="panel followup-context-panel">
          <span className="eyebrow">NEXT ACTION</span><h3>후속관리 체크</h3>
          <div className="next-action-list">
            <div><span>01</span><p><strong>상담 결과</strong><small>성공·후속·실패를 구분해 기록</small></p></div>
            <div><span>02</span><p><strong>관심 상품</strong><small>실제 반응이 있었던 상품군만 선택</small></p></div>
            <div><span>03</span><p><strong>재접촉 일정</strong><small>후속 필요 시 날짜를 지정</small></p></div>
          </div>
          <div className="privacy-note"><strong>개인정보 최소화</strong><p>점주 개인 정보 대신 업무에 필요한 매장·상담 정보만 기록합니다.</p></div>
        </aside>
      </section>
    </div>
  );
}
