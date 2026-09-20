import { useState } from 'react';
import { useAgent } from '../../app/AgentProvider.jsx';
import {
  actualOpenStatusLabels,
  categoryLabels,
  contractStatusLabels,
  installStatusLabels,
} from '../../data/mockData.js';
import { daysSince, formatDate, formatNumber } from '../../utils/format.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Icon from '../../components/ui/Icon.jsx';

const OPEN_VALUES = ['OPEN', 'PREPARING', 'CLOSED', 'UNKNOWN'];
const INSTALL_VALUES = ['PASS', 'FAIL', 'UNKNOWN'];
const CONTRACT_VALUES = ['CONTRACTED', 'UNDECIDED', 'NOT_REQUIRED', 'UNKNOWN'];
const PRODUCT_FIELDS = [
  ['INTERNET', 'internetStatus'],
  ['WIFI', 'wifiStatus'],
  ['POS', 'posStatus'],
  ['CCTV', 'cctvStatus'],
];

function Segment({ values, value, labels, onChange }) {
  return (
    <div className="segment-control">
      {values.map((item) => <button type="button" key={item} className={value === item ? 'active' : ''} aria-pressed={value === item} onClick={() => onChange(item)}>{labels[item] || item}</button>)}
    </div>
  );
}

function AnalysisColumn({ title, tone, items }) {
  return (
    <div className={`analysis-column ${tone}`}>
      <div className="analysis-column-head"><strong>{title}</strong><span>{items.length}</span></div>
      {items.length ? items.map((item) => <div className="analysis-item" key={item.category}><strong>{categoryLabels[item.category]}</strong><p>{item.reason}</p></div>) : <p className="analysis-empty">해당 항목 없음</p>}
    </div>
  );
}

export default function OpportunityPanel({ onProposal }) {
  const { selectedStore, verification, updateVerification, loadDemoVerification, liveAnalysis, generateProposal } = useAgent();
  const [rawOpen, setRawOpen] = useState(false);

  if (!selectedStore) {
    return <section className="opportunity-panel panel"><EmptyState title="확인할 음식점을 선택하세요" description="왼쪽 후보 목록에서 매장을 선택하면 상세 정보와 영업 기회 확인 화면이 표시됩니다." /></section>;
  }

  const handleGenerate = async () => {
    const ok = await generateProposal();
    if (ok) onProposal();
  };

  return (
    <section className="opportunity-panel panel">
      <header className="store-context-header">
        <div>
          <div className="store-title-line"><h2>{selectedStore.storeName}</h2><StatusBadge tone={daysSince(selectedStore.permitDate) <= 3 ? 'accent' : 'neutral'}>D+{daysSince(selectedStore.permitDate)}</StatusBadge></div>
          <p>{selectedStore.businessType} · {selectedStore.roadAddress}</p>
        </div>
        <button type="button" className="text-button" onClick={() => setRawOpen((v) => !v)}>{rawOpen ? '원천 데이터 닫기' : '원천 데이터 보기'}</button>
      </header>

      <div className="store-facts">
        <div><span>인허가일</span><strong>{formatDate(selectedStore.permitDate)}</strong></div>
        <div><span>소재지 면적</span><strong>{formatNumber(selectedStore.area, '㎡')}</strong></div>
        <div><span>시설 규모</span><strong>{formatNumber(selectedStore.facilitySize, '㎡')}</strong></div>
        <div><span>관리번호</span><strong className="mono small">{selectedStore.storeId}</strong></div>
      </div>

      {rawOpen && <div className="raw-data-grid">
        <div><span>전화</span><strong>{selectedStore.phone || '-'}</strong></div>
        <div><span>영업상태</span><strong>{selectedStore.businessStatus}</strong></div>
        <div><span>급수시설</span><strong>{selectedStore.waterSupplyType || '-'}</strong></div>
        <div><span>건물소유</span><strong>{selectedStore.buildingOwnershipType || '-'}</strong></div>
        <div><span>도로우편번호</span><strong>{selectedStore.roadPostalCode || '-'}</strong></div>
        <div><span>데이터 갱신</span><strong>{selectedStore.dataUpdatedAt || '-'}</strong></div>
      </div>}

      <div className="opportunity-workspace">
        <div className="verification-side">
          <div className="section-heading"><div><span className="eyebrow">HUMAN CHECK</span><h3>영업 가능 상태 확인</h3><p>직원이 확인하지 않은 값은 확인 필요로 유지합니다.</p></div><button type="button" className="text-button" onClick={loadDemoVerification}>시연 데이터 불러오기</button></div>

          <div className="verification-block">
            <label>실제 개업 상태</label>
            <Segment values={OPEN_VALUES} value={verification.actualOpenStatus} labels={actualOpenStatusLabels} onChange={(v) => updateVerification('actualOpenStatus', v)} />
          </div>
          <div className="verification-block">
            <label>KT 인터넷 설치 가능</label>
            <Segment values={INSTALL_VALUES} value={verification.installStatus} labels={installStatusLabels} onChange={(v) => updateVerification('installStatus', v)} />
          </div>

          <div className="product-status-list">
            <div className="product-status-head"><span>현재 상품 상태</span><small>기존 계약 여부 확인</small></div>
            {PRODUCT_FIELDS.map(([category, field]) => (
              <div className="product-status-row" key={category}>
                <div className="product-name"><span>{categoryLabels[category]}</span><small>{category}</small></div>
                <Segment values={CONTRACT_VALUES} value={verification[field]} labels={contractStatusLabels} onChange={(v) => updateVerification(field, v)} />
              </div>
            ))}
          </div>

          <label className="note-field"><span>확인 메모</span><textarea rows="3" value={verification.checkNote} onChange={(e) => updateVerification('checkNote', e.target.value)} placeholder="추가 확인이 필요한 내용만 기록하세요." /></label>
        </div>

        <aside className="analysis-side">
          <div className="section-heading compact"><div><span className="eyebrow">LIVE OPPORTUNITY</span><h3>상품 기회</h3><p>입력한 상태에 따라 즉시 갱신됩니다.</p></div></div>
          <div className="analysis-columns">
            <AnalysisColumn title="추천 가능" tone="recommend" items={liveAnalysis.recommend} />
            <AnalysisColumn title="추가 확인" tone="confirm" items={liveAnalysis.confirm} />
            <AnalysisColumn title="추천 제외" tone="exclude" items={liveAnalysis.exclude} />
          </div>
          <div className="opportunity-rule-note"><Icon name="check" size={18} /><p><strong>결정 규칙</strong><span>인터넷은 미정 + 설치 가능일 때만 추천합니다. 계약 완료·불필요는 제외하고 확인 필요는 보류합니다.</span></p></div>
          <button type="button" className="button primary wide" onClick={handleGenerate} disabled={!liveAnalysis.recommend.length}>맞춤 제안 만들기 <Icon name="arrow" size={18} /></button>
        </aside>
      </div>
    </section>
  );
}
