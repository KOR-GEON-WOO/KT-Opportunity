import { statusLabel } from "../utils/format";

export default function InstallStatus({
  candidates,
  onChange,
  onNext,
  onBack,
}) {
  const checkedCount = candidates.filter(
    (candidate) => candidate.installStatus
  ).length;

  const allChecked = checkedCount === candidates.length;

  const updateStatus = (candidateId, installStatus) => {
    const checkDate = new Date().toISOString().slice(0, 10);

    onChange(
      candidates.map((candidate) =>
        candidate.candidateId === candidateId
          ? { ...candidate, installStatus, checkDate }
          : candidate
      )
    );
  };

  return (
    <section className="workspace-panel page-enter">
      <div className="verification-banner">
        <span className="verification-icon">H</span>
        <div>
          <strong>Human Verification</strong>
          <span>직원이 직접 확인한 정보만 다음 단계에 반영됩니다.</span>
        </div>
      </div>

      <div className="panel-heading">
        <div>
          <span className="section-kicker">F-03 · 설치 가능 여부 입력</span>
          <h1>KT 인터넷 설치 상태 확인</h1>
          <p>KT 내부 전산에서 확인한 결과만 PASS 또는 FAIL로 입력합니다.</p>
        </div>
        <div className="progress-count">{checkedCount}/{candidates.length} 확인</div>
      </div>

      <div className="install-list">
        {candidates.map((candidate, index) => (
          <article
            className="install-card stagger-item"
            key={candidate.candidateId}
            style={{ "--delay": `${index * 50}ms` }}
          >
            <div className="install-card-info">
              <div className="install-title-row">
                <h3>{candidate.buildingName}</h3>
                <span
                  className={`status-badge ${
                    candidate.installStatus?.toLowerCase() ?? "pending"
                  }`}
                >
                  {statusLabel(candidate.installStatus)}
                </span>
              </div>
              <p>{candidate.address}</p>
              <div className="inline-stats">
                <span>{candidate.householdCount}세대</span>
                <span>{candidate.buildingAge}년</span>
                <span>{candidate.mainPurpose}</span>
              </div>
            </div>

            <div className="status-actions">
              <button
                type="button"
                className={
                  candidate.installStatus === "PASS"
                    ? "status-button pass selected"
                    : "status-button pass"
                }
                onClick={() => updateStatus(candidate.candidateId, "PASS")}
              >
                <span className="status-action-symbol">✓</span>
                <span>
                  PASS
                  <small>설치 가능</small>
                </span>
              </button>

              <button
                type="button"
                className={
                  candidate.installStatus === "FAIL"
                    ? "status-button fail selected"
                    : "status-button fail"
                }
                onClick={() => updateStatus(candidate.candidateId, "FAIL")}
              >
                <span className="status-action-symbol">×</span>
                <span>
                  FAIL
                  <small>설치 불가</small>
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {!allChecked && (
        <div className="warning-box">
          설치 상태가 확인되지 않은 후보는 다음 단계로 진행할 수 없습니다.
        </div>
      )}

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={onBack}>
          이전
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={onNext}
          disabled={!allChecked}
        >
          방문 우선순위 계산
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
