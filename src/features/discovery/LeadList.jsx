import { useEffect, useMemo, useState } from 'react';
import { useAgent } from '../../app/AgentProvider.jsx';
import { daysSince, formatDate } from '../../utils/format.js';
import { MOCK_DEMO_TODAY } from '../../data/mockData.js';
import { dataMode } from '../../services/dataClient.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const PAGE_SIZE = 20;

export default function LeadList() {
  const { restaurants, selectedStoreId, selectStore, lastExecutedConditions } = useAgent();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(restaurants.length / PAGE_SIZE));
  const displayToday = dataMode === 'mock' ? MOCK_DEMO_TODAY : undefined;

  useEffect(() => {
    setPage(1);
  }, [restaurants]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const items = useMemo(() => restaurants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [restaurants, page]);

  if (!restaurants.length) {
    return <aside className="lead-list panel"><EmptyState title="아직 조회한 음식점이 없습니다" description="상단 검색 조건을 확인하고 음식점을 조회해 주세요." /></aside>;
  }

  return (
    <aside className="lead-list panel">
      <div className="lead-list-head"><div><strong>{restaurants.length}개 후보</strong><span>{lastExecutedConditions?.regionLevel2 || ''} · 최신 인허가 순</span></div><StatusBadge>영업/정상</StatusBadge></div>
      <div className="lead-list-scroll">
        {items.map((store) => {
          const selected = store.storeId === selectedStoreId;
          return (
            <button key={store.storeId} type="button" className={selected ? 'lead-row selected' : 'lead-row'} onClick={() => selectStore(store.storeId)} aria-pressed={selected}>
              <div className="lead-row-top"><strong>{store.storeName}</strong><span>D+{daysSince(store.permitDate, displayToday)}</span></div>
              <p>{store.businessType} · {store.roadAddress}</p>
              <div className="lead-row-meta"><span>{formatDate(store.permitDate)}</span><span>{store.area ? `${store.area}㎡` : '면적 미확인'}</span></div>
            </button>
          );
        })}
      </div>
      {totalPages > 1 && <div className="pagination"><button type="button" disabled={page === 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>이전</button><span>{page} / {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage((v) => Math.min(totalPages, v + 1))}>다음</button></div>}
    </aside>
  );
}
