import ProductRecommendation from "../components/ProductRecommendation";
import SalesScript from "../components/SalesScript";

export default function Recommendation({ recommendation, onBack, onNext }) {
  return (
    <section className="workspace-panel recommendation-panel page-enter">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">F-05 · AI 영업 준비</span>
          <h1>상품 추천 및 상담 준비자료</h1>
          <p>검수된 상품 DB를 기준으로 추천하고, 결과는 직원 검토 후 사용합니다.</p>
        </div>
        <div className="ai-flow-indicator">
          <span>Mi:dm</span>
          <i />
          <span>HyperCLOVA X</span>
        </div>
      </div>

      <div className="recommendation-grid">
        <ProductRecommendation recommendation={recommendation} />

        <div className="ai-bridge" aria-hidden="true">
          <span />
        </div>

        <SalesScript script={recommendation.script} />
      </div>

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={onBack}>
          우선순위 다시 보기
        </button>
        <button className="primary-button" type="button" onClick={onNext}>
          최종 검토
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
