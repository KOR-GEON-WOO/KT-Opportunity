import { useEffect, useState } from "react";
import { fetchHistory } from "../services/mockApi";
import { statusLabel } from "../utils/format";

export default function History() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchHistory().then(setRows);
  }, []);

  return (
    <div className="page-width history-page">
      <section className="page-intro page-enter">
        <span className="section-kicker">F-06 · 방문 및 상담 이력</span>
        <h1>저장된 영업 이력</h1>
        <p>현재 MVP에서는 Google Sheets 대신 Mock 데이터를 표시합니다.</p>
      </section>

      <section className="workspace-panel page-enter">
        <div className="desktop-table table-wrap">
          <table>
            <thead>
              <tr>
                <th>건물명</th>
                <th>후보지 ID</th>
                <th>방문일</th>
                <th>방문 상태</th>
                <th>상담 결과</th>
                <th>우선순위</th>
                <th>추천 상품</th>
                <th>최종 수정</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.candidateId}>
                  <td><strong>{row.buildingName}</strong></td>
                  <td><code className="candidate-id">{row.candidateId}</code></td>
                  <td>{row.visitDate}</td>
                  <td><span className="status-badge">{statusLabel(row.visitStatus)}</span></td>
                  <td>{statusLabel(row.consultationResult)}</td>
                  <td>{row.priorityScore}점</td>
                  <td>{row.recommendedProductCode}</td>
                  <td>{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-candidate-list">
          {rows.map((row) => (
            <article className="mobile-candidate-card" key={row.candidateId}>
              <div className="mobile-card-top">
                <span className="status-badge">{statusLabel(row.visitStatus)}</span>
                <strong>{row.priorityScore}점</strong>
              </div>
              <h3>{row.buildingName}</h3>
              <p>{row.visitDate} 방문</p>
              <div className="mobile-card-stats">
                <span>{statusLabel(row.consultationResult)}</span>
                <span>{row.recommendedProductCode}</span>
              </div>
              <code className="candidate-id">{row.candidateId}</code>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
