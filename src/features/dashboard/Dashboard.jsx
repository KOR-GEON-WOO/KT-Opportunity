import { useMemo } from 'react';
import { mockRestaurants } from '../../data/mockData.js';
import { useAgent } from '../../app/AgentProvider.jsx';
import { daysSince, formatDate } from '../../utils/format.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function Dashboard({ onNavigate }) {
  const { restaurants, selectStore } = useAgent();
  const leads = useMemo(() => (restaurants.length ? restaurants : mockRestaurants.filter((item) => item.businessStatus === '영업/정상')).slice(0, 5), [restaurants]);
  const metrics = [
    ['신규 인허가', restaurants.length || 7, '최근 조회 기준', 'neutral'],
    ['확인 필요', Math.max(1, Math.min(8, Math.ceil((restaurants.length || 7) * 0.45))), '직원 확인 대기', 'warning'],
    ['제안 준비', Math.max(1, Math.min(5, Math.ceil((restaurants.length || 7) * 0.28))), '상품 검토 가능', 'accent'],
    ['후속 상담', 1, '일정 등록', 'success'],
  ];

  const openLead = (id) => {
    selectStore(id);
    onNavigate('discovery');
  };

  return (
    <div className="page-stack dashboard-page">
      <section className="welcome-strip">
        <div><span className="eyebrow">TODAY&apos;S SALES OPPORTUNITY</span><h2>최근 인허가 음식점에서 다음 영업 기회를 찾습니다.</h2><p>조회 → 직원 확인 → 상품 기회 → 상담안까지 한 매장 단위로 이어서 처리할 수 있습니다.</p></div>
        <button className="button primary" type="button" onClick={() => onNavigate('discovery')}>신규 음식점 찾기 <Icon name="arrow" size={18} /></button>
      </section>

      <section className="metric-grid">
        {metrics.map(([label, value, sub, tone]) => <article className={`metric-card ${tone}`} key={label}><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>)}
      </section>

      <section className="dashboard-grid">
        <article className="panel recent-leads-panel">
          <div className="panel-heading"><div><span className="eyebrow">RECENT LEADS</span><h3>최근 신규 음식점</h3></div><button className="text-button" type="button" onClick={() => onNavigate('discovery')}>전체 보기 <Icon name="arrow" size={16} /></button></div>
          <div className="dashboard-lead-list">
            {leads.map((store) => (
              <button type="button" className="dashboard-lead" key={store.storeId} onClick={() => openLead(store.storeId)}>
                <div className="lead-avatar">{store.businessType?.slice(0,1) || '매'}</div>
                <div className="lead-copy"><strong>{store.storeName}</strong><span>{store.businessType} · {store.regionLevel2} · 인허가 D+{daysSince(store.permitDate)}</span></div>
                <StatusBadge tone={daysSince(store.permitDate) <= 3 ? 'accent' : 'neutral'}>{formatDate(store.permitDate)}</StatusBadge>
                <Icon name="chevron" size={18} className="lead-chevron" />
              </button>
            ))}
          </div>
        </article>

        <aside className="panel activity-panel">
          <div className="panel-heading"><div><span className="eyebrow">WORKFLOW</span><h3>업무 흐름</h3></div></div>
          <ol className="workflow-list">
            <li><span>1</span><div><strong>신규 음식점 탐색</strong><p>지역·인허가일 기준 후보 조회</p></div></li>
            <li><span>2</span><div><strong>영업 기회 확인</strong><p>개업·설치·계약 상태 직원 확인</p></div></li>
            <li><span>3</span><div><strong>맞춤 제안</strong><p>규칙 엔진 후 검수 상품만 제안</p></div></li>
            <li><span>4</span><div><strong>상담 · 후속관리</strong><p>상담 결과와 다음 일정 기록</p></div></li>
          </ol>
          <div className="integrity-note"><Icon name="check" size={18} /><p><strong>Human verified</strong><span>확인하지 않은 상태는 UNKNOWN으로 유지합니다.</span></p></div>
        </aside>
      </section>
    </div>
  );
}
