export default function PriorityCard({ candidate, selected, onSelect }) {
  const householdPct = Math.round((candidate.householdScore / 60) * 100);
  const agePct = Math.round((candidate.ageScore / 40) * 100);

  return (
    <button
      type="button"
      className={selected ? "priority-card selected" : "priority-card"}
      onClick={() => onSelect(candidate.candidateId)}
    >
      <div className="rank-block">
        <span>{String(candidate.priorityRank).padStart(2, "0")}</span>
        <small>RANK</small>
      </div>

      <div className="priority-main">
        <div className="priority-title-row">
          <div>
            <h3>{candidate.buildingName}</h3>
            <p>{candidate.address}</p>
          </div>
          <div className="score-total">
            <strong>{candidate.priorityScore}</strong>
            <span>SCORE</span>
          </div>
        </div>

        <div className="score-detail-row">
          <div className="score-metric">
            <div className="score-metric-head">
              <span>세대수 · {candidate.householdCount}세대</span>
              <strong>{candidate.householdScore} / 60</strong>
            </div>
            <div className="score-track">
              <span
                className="score-fill"
                style={{ "--score-width": `${householdPct}%` }}
              />
            </div>
          </div>

          <div className="score-metric">
            <div className="score-metric-head">
              <span>건물 연식 · {candidate.buildingAge}년</span>
              <strong>{candidate.ageScore} / 40</strong>
            </div>
            <div className="score-track">
              <span
                className="score-fill"
                style={{ "--score-width": `${agePct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="priority-foot">
          <span className="status-badge pass">● PASS</span>
          <span>규칙 기반 점수 · 세대수 60 + 연식 40</span>
        </div>
      </div>
    </button>
  );
}
