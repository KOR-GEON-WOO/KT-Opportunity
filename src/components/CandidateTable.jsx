import { formatDate, formatNumber } from "../utils/format";

export default function CandidateTable({ candidates, onNext, onBack }) {
  return (
    <section className="workspace-panel page-enter">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">F-02 · 건축물 공공데이터 조회</span>
          <h1>1차 후보 건물</h1>
          <p>검색 조건에 실제로 부합하는 후보만 표시합니다.</p>
        </div>
        <div className="count-badge">{candidates.length}건</div>
      </div>

      <div className="candidate-toolbar">
        <div>
          <strong>후보 목록</strong>
          <small>주소, 연식, 세대수, 주용도와 후보지 ID를 확인하세요.</small>
        </div>
      </div>

      <div className="desktop-table table-wrap">
        <table>
          <thead>
            <tr>
              <th>건물</th>
              <th>사용승인일</th>
              <th>연식</th>
              <th>세대수</th>
              <th>건물 유형</th>
              <th>주용도</th>
              <th>설치 상태</th>
              <th>후보지 ID</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr
                key={candidate.candidateId}
                className="stagger-item"
                style={{ "--delay": `${index * 55}ms` }}
              >
                <td>
                  <div className="building-cell">
                    <strong>{candidate.buildingName}</strong>
                    <span>{candidate.address}</span>
                  </div>
                </td>
                <td>{formatDate(candidate.approvalDate)}</td>
                <td>{candidate.buildingAge}년</td>
                <td>{formatNumber(candidate.householdCount)}</td>
                <td>{candidate.buildingType}</td>
                <td>{candidate.mainPurpose}</td>
                <td><span className="status-badge pending">미확인</span></td>
                <td><code className="candidate-id">{candidate.candidateId}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-candidate-list">
        {candidates.map((candidate, index) => (
          <article
            key={candidate.candidateId}
            className="mobile-candidate-card stagger-item"
            style={{ "--delay": `${index * 55}ms` }}
          >
            <div className="mobile-card-top">
              <span className="mobile-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="status-badge pending">미확인</span>
            </div>
            <h3>{candidate.buildingName}</h3>
            <p>{candidate.address}</p>
            <div className="mobile-card-stats">
              <span><strong>{candidate.householdCount}</strong>세대</span>
              <span><strong>{candidate.buildingAge}</strong>년</span>
              <span>{candidate.buildingType}</span>
            </div>
            <code className="candidate-id">{candidate.candidateId}</code>
          </article>
        ))}
      </div>

      <div className="human-note">
        <span className="human-note-icon">!</span>
        <div>
          <strong>다음 단계는 직원 확인이 필요합니다.</strong>
          <span>KT 내부 전산에서 후보 건물의 인터넷 설치 가능 여부를 확인해 주세요.</span>
        </div>
      </div>

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={onBack}>
          조건 수정
        </button>
        <button className="primary-button" type="button" onClick={onNext}>
          설치 여부 확인
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
