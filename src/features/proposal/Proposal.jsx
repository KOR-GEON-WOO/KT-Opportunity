import { useState } from 'react';
import { useAgent } from '../../app/AgentProvider.jsx';
import { categoryLabels } from '../../data/mockData.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

export default function Proposal({ onNavigate }) {
  const { selectedStore, proposal, liveAnalysis, error } = useAgent();
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!selectedStore || !proposal) {
    return (
      <div className="page-stack">
        <section className="panel"><EmptyState title="생성된 맞춤 제안이 없습니다" description="신규 음식점에서 매장 상태를 확인한 뒤 맞춤 제안을 생성해 주세요." action={<button type="button" className="button primary" onClick={() => onNavigate('discovery')}>신규 음식점으로 이동</button>} /></section>
      </div>
    );
  }

  const primaryProduct = proposal.products?.[0] || null;

  return (
    <div className="page-stack proposal-page-v6">
      {error && <div className="global-error" role="alert">{error}</div>}
      <section className="store-context-strip panel">
        <div><span className="eyebrow">CURRENT STORE</span><h2>{selectedStore.storeName}</h2><p>{selectedStore.businessType} · {selectedStore.roadAddress}</p></div>
        <div className="context-actions"><StatusBadge tone="accent">제안 준비</StatusBadge><button type="button" className="button subtle" onClick={() => onNavigate('discovery')}>매장 상태 수정</button></div>
      </section>

      <section className="proposal-hero panel">
        <div className="proposal-hero-copy">
          <span className="eyebrow">RECOMMENDED APPROACH</span>
          <h2>{primaryProduct ? primaryProduct.productName : '확인된 상품군을 중심으로 상담을 시작하세요'}</h2>
          <p>{proposal.strategy.summary}</p>
          <div className="proposal-tags">
            {liveAnalysis.recommend.map((item) => <StatusBadge key={item.category} tone="accent">{categoryLabels[item.category]} 추천</StatusBadge>)}
            {liveAnalysis.confirm.map((item) => <StatusBadge key={item.category} tone="warning">{categoryLabels[item.category]} 확인 필요</StatusBadge>)}
          </div>
        </div>
        <div className="proposal-hero-action">
          <small>상담 우선순위</small>
          <strong>{proposal.strategy.priority === 'HIGH' ? '높음' : '보통'}</strong>
          <button type="button" className="button primary" onClick={() => onNavigate('followup')}>상담 기록으로 이동 <Icon name="arrow" size={18} /></button>
        </div>
      </section>

      <section className="proposal-content-grid">
        <article className="panel proposal-reason-card">
          <div className="panel-heading"><div><span className="eyebrow">WHY THIS PROPOSAL</span><h3>추천 근거</h3></div></div>
          <div className="reason-list">
            {proposal.strategy.points.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}
          </div>
          <div className="check-list-block"><strong>이번 상담에서 확인할 것</strong>{proposal.strategy.additionalChecks.length ? proposal.strategy.additionalChecks.map((item) => <p key={item}>• {item}</p>) : <p>추가 확인사항 없음</p>}</div>
        </article>

        <article className="panel product-offer-card">
          <div className="panel-heading"><div><span className="eyebrow">VERIFIED PRODUCT</span><h3>제안 가능 상품</h3></div><StatusBadge tone="success">검수 완료</StatusBadge></div>
          {proposal.products?.length ? proposal.products.map((product) => (
            <div className="verified-product" key={product.productCode}>
              <div className="verified-product-head"><div><span>{categoryLabels[product.productCategory]}</span><h4>{product.productName}</h4></div><code>{product.productCode}</code></div>
              <dl><div><dt>월 요금</dt><dd>{formatCurrency(product.monthlyFee)}</dd></div><div><dt>가입 조건</dt><dd>{product.eligibilityCondition}</dd></div><div><dt>검수일</dt><dd>{product.verifiedAt}</dd></div></dl>
            </div>
          )) : <div className="catalog-empty">구체 상품으로 연결할 수 있는 검수 데이터가 없습니다.</div>}
          {proposal.catalogMissing?.map((item) => <div className="catalog-warning" key={item.category}><strong>{categoryLabels[item.category]}</strong><p>{item.reason}</p></div>)}
        </article>
      </section>

      <section className="panel script-panel">
        <div className="panel-heading"><div><span className="eyebrow">SALES SCRIPT</span><h3>첫 상담 문구</h3></div><span className="generated-at">{formatDateTime(proposal.generatedAt)}</span></div>
        <div className="script-lines">
          {proposal.script.map((line, index) => <div key={`${index}-${line}`}><span>{index + 1}</span><p>{line}</p></div>)}
        </div>
      </section>

      <section className="agent-details panel">
        <button type="button" className="agent-details-toggle" onClick={() => setDetailsOpen((v) => !v)} aria-expanded={detailsOpen}>
          <div><span className="eyebrow">AGENT DETAILS</span><strong>처리 정보 보기</strong></div><span>{detailsOpen ? '닫기' : '펼치기'}</span>
        </button>
        {detailsOpen && <div className="agent-details-body">
          <div className="model-flow">{proposal.modelFlow?.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong></div>)}</div>
          <div className="validation-box"><p><span>Schema</span><strong className={proposal.validation?.schema === 'PASS' ? 'pass' : 'unknown'}>{proposal.validation?.schema || '미수신'}</strong></p><p><span>Product code</span><strong className={proposal.validation?.productCodes === 'PASS' ? 'pass' : 'unknown'}>{proposal.validation?.productCodes || '미수신'}</strong></p></div>
          <p className="no-hallucination-copy">입력 데이터에 없는 상품명·가격·혜택·가입조건은 생성하지 않습니다.</p>
        </div>}
      </section>
    </div>
  );
}
