import { useEffect, useMemo, useState } from "react";
import { categoryLabels } from "../data/mockData";
import { dataClient } from "../services/dataClient";
import { formatDate, formatDateTime } from "../utils/format";

export default function History() {
  const [rows, setRows] = useState([]);
  useEffect(() => { dataClient.fetchHistory().then(setRows); }, []);
  const metrics = useMemo(() => ({ total: rows.length, followUp: rows.filter((x) => x.leadStatus === "FOLLOW_UP").length, converted: rows.filter((x) => x.leadStatus === "CONVERTED").length }), [rows]);

  return (
    <div className="page-width history-page">
      <section className="history-hero"><div><span className="eyebrow">F-05 · SALES PIPELINE</span><h1>상담 · 후속관리</h1><p>매장 현황과 상담 이력을 분리해 추적합니다. 이전 상담 이력은 덮어쓰지 않습니다.</p></div><div className="history-metrics"><div><span>전체 매장</span><strong>{metrics.total}</strong></div><div><span>FOLLOW_UP</span><strong>{metrics.followUp}</strong></div><div><span>CONVERTED</span><strong>{metrics.converted}</strong></div></div></section>
      <section className="workspace-card history-table-card">
        <div className="panel-title"><div><span className="section-code">GOOGLE SHEETS TARGET SCHEMA</span><h2>영업 파이프라인</h2></div><span className="rule-chip">storeId 기준</span></div>
        {rows.length ? <div className="table-wrap"><table className="history-table"><thead><tr><th>매장</th><th>Lead</th><th>상담 상태</th><th>결과</th><th>관심 상품</th><th>후속일</th><th>최종 수정</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.storeId}-${row.updatedAt}`}><td><strong>{row.storeName}</strong><small>{row.roadAddress}</small><code>{row.storeId}</code></td><td><span className="lead-badge">{row.leadStatus}</span></td><td>{row.consultationStatus}</td><td>{row.consultationResult || "-"}</td><td><div className="mini-tags">{row.interestProducts?.map((item) => <span key={item}>{categoryLabels[item]}</span>)}</div></td><td>{row.followUpDate ? formatDate(row.followUpDate) : "-"}</td><td>{formatDateTime(row.updatedAt)}</td></tr>)}</tbody></table></div> : <div className="empty-results"><h3>저장된 상담 이력이 없습니다</h3><p>Agent에서 저장 승인한 결과가 여기에 표시됩니다.</p></div>}
      </section>
    </div>
  );
}
