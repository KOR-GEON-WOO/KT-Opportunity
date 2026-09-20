import { useEffect, useState } from 'react';
import { dataClient } from '../../services/dataClient.js';
import { categoryLabels } from '../../data/mockData.js';
import { formatDateTime } from '../../utils/format.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

const leadLabels = { DISCOVERED: '발굴', VERIFIED: '검증 완료', READY: '상담 준비', CONTACTED: '접촉 완료', FOLLOW_UP: '후속 상담', CONVERTED: '전환', CLOSED: '종료' };
const consultationLabels = { NOT_STARTED: '상담 전', SCHEDULED: '일정 확정', IN_PROGRESS: '상담 중', COMPLETED: '상담 완료', CANCELLED: '취소' };

export default function History({ onlyFollowUp = false }) {
  const [state, setState] = useState({ status: 'loading', items: [], error: null });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', items: [], error: null });
    dataClient.fetchHistory().then((items) => {
      if (!active) return;
      const filtered = onlyFollowUp ? items.filter((item) => item.followUpDate || item.leadStatus === 'FOLLOW_UP') : items;
      setState({ status: filtered.length ? 'success' : 'empty', items: filtered, error: null });
    }).catch((error) => {
      if (active) setState({ status: 'error', items: [], error: error.message || '상담 이력을 불러오지 못했습니다.' });
    });
    return () => { active = false; };
  }, [onlyFollowUp]);

  if (state.status === 'loading') return <div className="page-stack"><section className="panel history-state"><div className="loading-spinner" /><p>상담 이력을 불러오는 중입니다.</p></section></div>;
  if (state.status === 'error') return <div className="page-stack"><div className="global-error" role="alert">{state.error}</div></div>;
  if (state.status === 'empty') return <div className="page-stack"><section className="panel"><EmptyState title={onlyFollowUp ? '예정된 후속 상담이 없습니다' : '저장된 상담 이력이 없습니다'} description="상담 결과를 저장하면 이곳에 누적됩니다." /></section></div>;

  return (
    <div className="page-stack history-page">
      <section className="panel history-panel">
        <div className="panel-heading"><div><span className="eyebrow">{onlyFollowUp ? 'FOLLOW-UP QUEUE' : 'CONSULTATION HISTORY'}</span><h3>{onlyFollowUp ? '후속 상담 일정' : '상담 이력'}</h3><p>동일 매장도 상담 건별로 누적해 표시합니다.</p></div><StatusBadge>{state.items.length}건</StatusBadge></div>
        <div className="history-table-wrap">
          <table className="history-table">
            <thead><tr><th>매장</th><th>Lead</th><th>상담 상태</th><th>관심 상품</th><th>후속일</th><th>업데이트</th></tr></thead>
            <tbody>{state.items.map((item, index) => <tr key={`${item.storeId}-${item.updatedAt}-${index}`}><td><strong>{item.storeName}</strong><span>{item.roadAddress}</span></td><td>{leadLabels[item.leadStatus] || item.leadStatus}</td><td>{consultationLabels[item.consultationStatus] || item.consultationStatus}</td><td>{item.interestProducts?.length ? item.interestProducts.map((value) => categoryLabels[value] || value).join(', ') : '-'}</td><td>{item.followUpDate || '-'}</td><td>{formatDateTime(item.updatedAt)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
