export default function PriorityCard({ candidate, selected, onSelect }) {
  return (
    <button
      type="button"
      className={selected ? "priority-card selected" : "priority-card"}
      onClick={() => onSelect(candidate.candidateId)}
    >
      <div className="rank-block">
        <span>{candidate.priorityRank}</span>
        <small>순위</small>
      </div>

      <div className="priority-main">
        <div className="priority-title-row">
          <div>
            <h3>{candidate.buildingName}</h3>
            <p>{candidate.address}</p>
          </div>
          <strong className="score-total">{candidate.priorityScore}점</strong>
        </div>

        <div className="score-grid">
          <div>
            <span>세대수</span>
            <strong>{candidate.householdCount}세대</strong>
            <small>{candidate.householdScore}/60점</small>
          </div>
          <div>
            <span>건물 연식</span>
            <strong>{candidate.buildingAge}년</strong>
            <small>{candidate.ageScore}/40점</small>
          </div>
          <div>
            <span>설치 상태</span>
            <strong className="pass-text">PASS</strong>
            <small>{candidate.checkDate}</small>
          </div>
        </div>
      </div>
    </button>
  );
}
