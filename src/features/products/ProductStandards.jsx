import { verifiedProducts, categoryLabels } from '../../data/mockData.js';
import { formatCurrency } from '../../utils/format.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

export default function ProductStandards() {
  return (
    <div className="page-stack products-page">
      <section className="panel product-policy-card">
        <span className="eyebrow">VERIFIED CATALOG ONLY</span><h2>Agent는 검수 완료 상품만 구체적으로 제안합니다.</h2><p>상품명·가격·혜택·가입 조건은 등록된 기준 데이터와 유효기간을 통과한 경우에만 상담안에 사용할 수 있습니다.</p>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><span className="eyebrow">PRODUCT CATALOG</span><h3>현재 검수 상품</h3></div><StatusBadge tone="success">{verifiedProducts.length}개</StatusBadge></div>
        <div className="product-standard-list">
          {verifiedProducts.map((product) => <article key={product.productCode}><div className="product-standard-title"><span>{categoryLabels[product.productCategory]}</span><h4>{product.productName}</h4><code>{product.productCode}</code></div><dl><div><dt>월 요금</dt><dd>{formatCurrency(product.monthlyFee)}</dd></div><div><dt>가입 조건</dt><dd>{product.eligibilityCondition}</dd></div><div><dt>혜택</dt><dd>{product.benefit}</dd></div><div><dt>유효기간</dt><dd>{product.validFrom} ~ {product.validTo}</dd></div><div><dt>검수일</dt><dd>{product.verifiedAt}</dd></div></dl></article>)}
        </div>
        <div className="catalog-policy-note"><strong>Wi-Fi / POS / CCTV</strong><p>현재 기능기술서에 검수된 구체 상품 데이터가 없으므로 상품명·가격을 임의 생성하지 않습니다. 추천 후보 상품군으로만 표시합니다.</p></div>
      </section>
    </div>
  );
}
