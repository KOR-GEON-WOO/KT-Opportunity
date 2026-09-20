import { useMemo, useState } from "react";

export default function ApprovalPanel({
  candidates,
  recommendations,
  onApprove,
  onBack,
  onReset,
  saving,
  savedResult,
}) {
  const [approved, setApproved] = useState(false);
  const [reviewOverride, setReviewOverride] = useState(false);

  const reviewCount = useMemo(
    () => recommendations.filter((item) => item.requiresReview).length,
    [recommendations]
  );

  const hasReviewRequired = reviewCount > 0;
  const canSave =
    approved &&
    (!hasReviewRequired || reviewOverride) &&
    !saving &&
    !savedResult;

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
          <span>재검수 대상</span>
          <strong className={reviewCount ? "approval-warning-code" : ""}>
            {reviewCount}
          </strong>
          <small>상품 정보</small>
        </div>
      </div>

      {hasReviewRequired && (
        <div className="approval-review-warning">
          <span>!</span>
          <div>
            <strong>상품 재검수가 필요한 후보가 {reviewCount}건 있습니다.</strong>
            <p>
              상품 코드는 비워 둔 상태로 방문 예정 목록에 저장됩니다. 최신 상품 정보를
              확인하기 전에는 구체적인 가격·혜택을 안내하지 마세요.
            </p>
          </div>
        </div>
      )}

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

      {hasReviewRequired && (
        <label
          className={
            reviewOverride
              ? "approval-check override checked"
              : "approval-check override"
          }
        >
          <input
            type="checkbox"
            checked={reviewOverride}
            onChange={(event) => setReviewOverride(event.target.checked)}
          />
          <span className="custom-check">✓</span>
          <span>
            재검수 대상이 포함되어 있음을 확인했으며, 미확인 상품 상태로 저장합니다.
          </span>
        </label>
      )}

      {savedResult && (
        <div className="save-success">
          <div className="save-success-icon">✓</div>
          <div>
            <strong>방문 예정 목록에 저장되었습니다</strong>
            <span>
              {savedResult.savedCount}건 ·{" "}
              {new Date(savedResult.savedAt).toLocaleString("ko-KR")}
            </span>
          </div>
        </div>
      )}

      <div className="action-row">
        {savedResult ? (
          <>
            <button className="secondary-button" type="button" onClick={onBack}>
              추천 결과 보기
            </button>
            <button className="primary-button" type="button" onClick={onReset}>
              새 후보지 검색
              <span aria-hidden="true">→</span>
            </button>
          </>
        ) : (
          <>
            <button className="secondary-button" type="button" onClick={onBack}>
              추천 결과 다시 보기
            </button>
            <button
              className={canSave ? "primary-button ready" : "primary-button"}
              type="button"
              disabled={!canSave}
              onClick={() => onApprove(true)}
            >
              {saving ? "저장 중..." : "승인 및 저장"}
              {!saving && <span aria-hidden="true">→</span>}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
