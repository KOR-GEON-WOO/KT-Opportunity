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
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">F-06 · 최종 검토 및 저장</span>
          <h1>직원 최종 승인</h1>
          <p>
            추천 상품과 상담 스크립트를 확인한 뒤 승인한 데이터만 저장합니다.
          </p>
        </div>
        <div className="human-gate">Human Review Required</div>
      </div>

      <div className="approval-summary">
        <div>
          <span>저장 대상</span>
          <strong>{candidates.length}개 후보지</strong>
        </div>
        <div>
          <span>AI 추천 생성</span>
          <strong>{recommendations.length}건</strong>
        </div>
        <div>
          <span>저장 조건</span>
          <strong>saveApproved=true</strong>
        </div>
      </div>

      <label className="approval-check">
        <input
          type="checkbox"
          checked={approved}
          onChange={(event) => setApproved(event.target.checked)}
        />
        <span>
          후보지, 추천 상품, 상담자료를 최종 검토했으며 저장을 승인합니다.
        </span>
      </label>

      {savedResult && (
        <div className="success-box">
          저장 완료 · {savedResult.savedCount}건 ·{" "}
          {new Date(savedResult.savedAt).toLocaleString("ko-KR")}
        </div>
      )}

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={onBack}>
          추천 결과 다시 보기
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={!approved || saving || Boolean(savedResult)}
          onClick={() => onApprove(approved)}
        >
          {saving ? "저장 중..." : savedResult ? "저장 완료" : "승인 및 저장"}
        </button>
      </div>
    </section>
  );
}
