import { formatDate } from "../utils/format";

export default function ProductRecommendation({ recommendation }) {
  const { product, reason, salesPoints } = recommendation;

  return (
    <section className="recommendation-box">
      <div className="recommendation-label">Mi:dm · 상품 매칭</div>

      <div className="product-heading">
        <div>
          <small>{product.productCode}</small>
          <h2>{product.productName}</h2>
        </div>
        <span className="verified-badge">검수 완료</span>
      </div>

      <dl className="product-meta">
        <div>
          <dt>추천 조건</dt>
          <dd>{product.eligibilityCondition}</dd>
        </div>
        <div>
          <dt>검수 정보</dt>
          <dd>
            {formatDate(product.validFrom)} ~ {formatDate(product.validTo)}
            <br />
            최종 검수 {formatDate(product.verifiedAt)}
          </dd>
        </div>
      </dl>

      <div className="reason-box">
        <strong>추천 근거</strong>
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
