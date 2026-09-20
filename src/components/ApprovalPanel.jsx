import { useState } from "react";

export default function ApprovalPanel({
  candidates,
  recommendations,
  onApprove,
  onBack,
  saving,
  savedResult,
}) {
  const [approved, setApproved] = useState(false);

  return (
    <section className="workspace-panel approval-panel page-enter">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">F-06 · 최종 검토 및 저장</span>
          <h1>최종 저장 전 확인</h1>
          <p>추천 결과를 직원이 직접 검토하고 승인한 경우에만 저장합니다.</p>
        </div>
        <div className="human-gate">Human Review Required</div>
      </div>

      <div className="approval-summary">
        <div>
          <span>저장 대상</span>
          <strong>{candidates.length}</strong>
          <small>후보지</small>
        </div>
        <div>
          <span>AI 추천 생성</span>
          <strong>{recommendations.length}</strong>
          <small>추천 결과</small>
        </div>
        <div>
          <span>저장 조건</span>
          <strong className="approval-code">TRUE</strong>
          <small>saveApproved</small>
        </div>
      </div>

      <label className={approved ? "approval-check checked" : "approval-check"}>
        <input
          type="checkbox"
          checked={approved}
          onChange={(event) => setApproved(event.target.checked)}
        />
        <span className="custom-check">✓</span>
        <span>
          후보지, 추천 상품, 상담자료를 최종 검토했으며 저장을 승인합니다.
        </span>
      </label>

      {savedResult && (
        <div className="save-success">
          <div className="save-success-icon">✓</div>
          <div>
            <strong>저장이 완료되었습니다</strong>
            <span>
              {savedResult.savedCount}건 ·{" "}
              {new Date(savedResult.savedAt).toLocaleString("ko-KR")}
            </span>
          </div>
        </div>
      )}

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={onBack}>
          추천 결과 다시 보기
        </button>
        <button
          className={approved ? "primary-button ready" : "primary-button"}
          type="button"
          disabled={!approved || saving || Boolean(savedResult)}
          onClick={() => onApprove(approved)}
        >
          {saving ? "저장 중..." : savedResult ? "저장 완료" : "승인 및 저장"}
          {!saving && !savedResult && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </section>
  );
}
