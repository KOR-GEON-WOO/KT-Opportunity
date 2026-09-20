import { useEffect, useState } from "react";
import { fetchHistory } from "../services/mockApi";
import { statusLabel } from "../utils/format";

export default function History() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchHistory().then(setRows);
  }, []);

  return (
    <div className="page-width">
      <section className="page-intro">
        <span className="section-kicker">F-06 · 방문 및 상담 이력</span>
        <h1>저장된 영업 이력</h1>
        <p>
          현재 MVP에서는 Google Sheets 대신 Mock 데이터를 표시합니다.
        </p>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>건물명</th>
                <th>후보지 ID</th>
                <th>방문일</th>
                <th>방문 상태</th>
                <th>상담 결과</th>
                <th>우선순위 점수</th>
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
                  <td>{statusLabel(row.visitStatus)}</td>
                  <td>{statusLabel(row.consultationResult)}</td>
                  <td>{row.priorityScore}점</td>
                  <td>{row.recommendedProductCode}</td>
                  <td>{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
