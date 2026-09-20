import { useEffect, useState } from "react";
import { fetchHistory } from "../services/mockApi";
import { formatDate, statusLabel } from "../utils/format";

function formatUpdatedAt(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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
        <p>
          Demo 저장 데이터는 브라우저에 유지됩니다. 실제 연동 단계에서는 Google Sheets
          데이터로 대체합니다.
        </p>
      </section>

      <section className="workspace-panel page-enter">
        <div className="history-summary">
          <div>
            <span>저장 항목</span>
            <strong>{rows.length}</strong>
          </div>
          <p>현재 브라우저의 Demo 이력 + 기본 시연 데이터</p>
        </div>

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
                <th>검수 상태</th>
                <th>최종 수정</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.candidateId}>
                  <td>
                    <div className="building-cell">
                      <strong>{row.buildingName}</strong>
                      {row.address && <span>{row.address}</span>}
                    </div>
                  </td>
                  <td><code className="candidate-id">{row.candidateId}</code></td>
                  <td>{row.visitDate ? formatDate(row.visitDate) : "미정"}</td>
                  <td><span className="status-badge">{statusLabel(row.visitStatus)}</span></td>
                  <td>{statusLabel(row.consultationResult)}</td>
                  <td>{row.priorityScore ?? "-"}점</td>
                  <td>{row.recommendedProductCode ?? "재검수 필요"}</td>
                  <td>
                    <span className={row.reviewRequired ? "status-badge review" : "status-badge pass"}>
                      {row.reviewRequired ? "재검수" : "확인"}
                    </span>
                  </td>
                  <td>{formatUpdatedAt(row.updatedAt)}</td>
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
                <strong>{row.priorityScore ?? "-"}점</strong>
              </div>
              <h3>{row.buildingName}</h3>
              <p>{row.visitDate ? `${formatDate(row.visitDate)} 방문` : "방문일 미정"}</p>
              <div className="mobile-card-stats">
                <span>{statusLabel(row.consultationResult)}</span>
                <span>{row.recommendedProductCode ?? "상품 재검수"}</span>
              </div>
              <code className="candidate-id">{row.candidateId}</code>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
