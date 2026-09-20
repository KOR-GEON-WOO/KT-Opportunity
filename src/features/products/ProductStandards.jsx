import { useEffect, useMemo, useState } from 'react';
import { categoryLabels, MOCK_DEMO_TODAY } from '../../data/mockData.js';
import { dataClient, dataMode } from '../../services/dataClient.js';
import { formatCurrency } from '../../utils/format.js';
import { getKstToday } from '../../utils/clock.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

function isActiveProduct(product, today) {
  return (!product.validFrom || product.validFrom <= today) && (!product.validTo || today <= product.validTo);
}

export default function ProductStandards() {
  const [state, setState] = useState({ status: 'loading', items: [], error: null });
  const referenceDate = dataMode === 'mock' ? MOCK_DEMO_TODAY : getKstToday();

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', items: [], error: null });
    dataClient.fetchProductCatalog()
      .then((items) => {
        if (!active) return;
        setState({ status: items.length ? 'success' : 'empty', items, error: null });
      })
      .catch((error) => {
        if (active) setState({ status: 'error', items: [], error: error.message || '상품 기준을 불러오지 못했습니다.' });
      });
    return () => { active = false; };
  }, []);

  const activeCount = useMemo(
    () => state.items.filter((product) => isActiveProduct(product, referenceDate)).length,
    [state.items, referenceDate]
  );

  return (
    <div className="page-stack products-page">
      <section className="panel product-policy-card">
        <span className="eyebrow">VERIFIED CATALOG ONLY</span>
        <h2>Agent는 검수된 상품 기준만 사용합니다.</h2>
        <p>상품명·가격·혜택·가입 조건은 서버 또는 PoC 검수 데이터와 유효기간을 통과한 경우에만 상담안에 사용할 수 있습니다.</p>
      </section>

      {state.status === 'loading' && <section className="panel history-state"><div className="loading-spinner" /><p>상품 기준을 불러오는 중입니다.</p></section>}
      {state.status === 'error' && <div className="global-error" role="alert">{state.error}</div>}
      {state.status === 'empty' && <section className="panel"><EmptyState title="등록된 검수 상품이 없습니다" description="검수된 상품 데이터가 등록되면 이곳에 표시됩니다." /></section>}

      {state.status === 'success' && <section className="panel">
        <div className="panel-heading">
          <div><span className="eyebrow">PRODUCT CATALOG</span><h3>상품 기준</h3><p>{dataMode === 'mock' ? `PoC 기준일 ${referenceDate}` : `조회 기준일 ${referenceDate}`}</p></div>
          <StatusBadge tone={activeCount ? 'success' : 'warning'}>유효 {activeCount}개 / 전체 {state.items.length}개</StatusBadge>
        </div>
        <div className="product-standard-list">
          {state.items.map((product) => {
            const active = isActiveProduct(product, referenceDate);
            return <article key={product.productCode}>
              <div className="product-standard-title">
                <span>{categoryLabels[product.productCategory] || product.productCategory}</span>
                <h4>{product.productName}</h4>
                <code>{product.productCode}</code>
                <StatusBadge tone={active ? 'success' : 'warning'}>{active ? '유효' : '유효기간 외'}</StatusBadge>
              </div>
              <dl>
                <div><dt>월 요금</dt><dd>{formatCurrency(product.monthlyFee)}</dd></div>
                <div><dt>가입 조건</dt><dd>{product.eligibilityCondition || '-'}</dd></div>
                <div><dt>혜택</dt><dd>{product.benefit || '-'}</dd></div>
                <div><dt>유효기간</dt><dd>{product.validFrom || '-'} ~ {product.validTo || '-'}</dd></div>
                <div><dt>검수일</dt><dd>{product.verifiedAt || '-'}</dd></div>
              </dl>
            </article>;
          })}
        </div>
        <div className="catalog-policy-note"><strong>Wi-Fi / POS / CCTV</strong><p>검수된 구체 상품 데이터가 없으면 상품명·가격을 임의 생성하지 않고 추천 후보 상품군으로만 표시합니다.</p></div>
      </section>}
    </div>
  );
}
