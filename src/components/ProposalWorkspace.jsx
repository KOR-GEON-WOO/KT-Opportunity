import { categoryLabels } from "../data/mockData";
import { formatCurrency } from "../utils/format";

export default function ProposalWorkspace({ store, proposal, analysis, onBack, onNext }) {
  return (
    <section className="proposal-page">
      <div className="model-flow-bar"><span>HyperCLOVA X</span><i>분석 JSON</i><span className="swap">VRAM 반환</span><i>→</i><span>KT Mi:dm</span><strong>F-04 LOCK</strong></div>
      <div className="proposal-grid">
        <article className="strategy-card">
          <div className="panel-title"><div><span className="section-code">HYPERCLOVA X · ANALYSIS</span><h2>상담 전략</h2></div><span className={`priority-badge ${proposal.strategy.priority.toLowerCase()}`}>{proposal.strategy.priority}</span></div>
          <p className="strategy-summary">{proposal.strategy.summary}</p>
          <div className="strategy-points">{proposal.strategy.points.map((point, index) => <div key={point}><span>{String(index + 1).padStart(2,"0")}</span><p>{point}</p></div>)}</div>
          <div className="additional-checks"><span>추가 확인사항</span>{proposal.strategy.additionalChecks.length ? proposal.strategy.additionalChecks.map((item) => <p key={item}>• {item}</p>) : <p>추가 확인사항 없음</p>}</div>
        </article>

        <article className="product-bundle-card">
          <div className="panel-title"><div><span className="section-code">VERIFIED KT PRODUCT DATA</span><h2>제안 가능 상품</h2></div><span className="validated-chip">CODE VALIDATED</span></div>
          {proposal.products.length ? proposal.products.map((product) => (
            <div className="product-row" key={product.productCode}>
              <div className="product-category">{categoryLabels[product.productCategory]}</div>
              <div className="product-main"><h3>{product.productName}</h3><code>{product.productCode}</code><p>{product.eligibilityCondition}</p></div>
              <div className="product-price"><strong>{formatCurrency(product.monthlyFee)}</strong><small>{product.sourceLabel}</small></div>
              <div className="product-validity"><span>{product.validFrom} ~ {product.validTo}</span><small>검수 {product.verifiedAt}</small></div>
            </div>
          )) : <div className="catalog-empty">검수된 상품 기준 데이터와 일치하는 상품이 없습니다.</div>}
          {proposal.catalogMissing.map((item) => <div className="catalog-missing" key={item.category}><strong>{categoryLabels[item.category]}</strong><p>{item.reason}</p></div>)}
        </article>
      </div>

      <article className="script-card">
        <div className="script-head"><div><span className="section-code">KT Mi:dm · SALES SCRIPT</span><h2>{store.storeName} 고객 응대 문구</h2></div><span className="generated-chip">검수 데이터만 사용</span></div>
        <div className="script-body">{proposal.script.map((line, index) => <p key={line}><span>{index + 1}</span>{line}</p>)}</div>
        <div className="no-hallucination"><strong>NO HALLUCINATION RULE</strong><span>입력 데이터에 없는 상품명 · 가격 · 혜택 · 가입조건은 생성하지 않습니다.</span></div>
      </article>

      <div className="action-row"><button className="secondary-button" onClick={onBack}>상품 분석 보기</button><button className="primary-button" onClick={onNext}>상담 결과 · 후속관리 <span>→</span></button></div>
    </section>
  );
}
