import { formatDate } from "../utils/format";

export default function ProductRecommendation({ recommendation }) {
  const { product, reason, salesPoints, requiresReview, reviewReason } = recommendation;

  return (
    <section className="recommendation-box midm-card">
      <div className="ai-panel-head">
        <div>
          <span className="ai-panel-eyebrow">PRODUCT MATCH</span>
          <h2>KT Mi:dm</h2>
        </div>
        <span className="model-status">DEMO AI</span>
      </div>

      {requiresReview || !product ? (
        <div className="review-required-card">
          <span className="review-icon">!</span>
          <div>
            <strong>상품 재검수 필요</strong>
            <p>{reviewReason ?? "현재 추천 가능한 검수 완료 상품이 없습니다."}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="product-card-main">
            <small>{product.productCode}</small>
            <h3>{product.productName}</h3>
            <span className="verified-badge">✓ 검수 완료</span>
          </div>

          <dl className="product-meta">
            <div>
              <dt>추천 조건</dt>
              <dd>{product.eligibilityCondition}</dd>
            </div>
            <div>
              <dt>적용 기간</dt>
              <dd>
                {formatDate(product.validFrom)} ~ {formatDate(product.validTo)}
              </dd>
            </div>
            <div>
              <dt>최종 검수</dt>
              <dd>{formatDate(product.verifiedAt)}</dd>
            </div>
          </dl>
        </>
      )}

      <div className="reason-box">
        <strong>{requiresReview ? "처리 결과" : "추천 근거"}</strong>
        <p>{reason}</p>
      </div>

      <div className="sales-point-list">
        {salesPoints.map((point) => (
          <div key={point}>
            <span>✓</span>
            <p>{point}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
