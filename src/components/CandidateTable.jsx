import { formatDate, formatNumber } from "../utils/format";

export default function CandidateTable({ candidates, onNext, onBack }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">F-02 · 건축물 공공데이터 조회</span>
          <h1>1차 후보 건물</h1>
          <p>
            건축HUB 응답을 조건에 맞게 필터링한 후보 목록입니다.
          </p>
        </div>
        <div className="count-badge">{candidates.length}건</div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>건물명</th>
              <th>주소</th>
              <th>사용승인일</th>
              <th>연식</th>
              <th>세대수</th>
              <th>주용도</th>
              <th>후보지 ID</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.candidateId}>
                <td>
                  <strong>{candidate.buildingName}</strong>
                </td>
                <td>{candidate.address}</td>
                <td>{formatDate(candidate.approvalDate)}</td>
                <td>{candidate.buildingAge}년</td>
                <td>{formatNumber(candidate.householdCount)}</td>
                <td>{candidate.mainPurpose}</td>
                <td>
                  <code className="candidate-id">{candidate.candidateId}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box">
        <strong>다음 단계는 직원 확인이 필요합니다.</strong>
        <span>
          KT 내부 전산에서 각 후보의 인터넷 설치 가능 여부를 확인해 주세요.
        </span>
      </div>

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={onBack}>
          조건 수정
        </button>
        <button className="primary-button" type="button" onClick={onNext}>
          설치 여부 확인
        </button>
      </div>
    </section>
  );
}
