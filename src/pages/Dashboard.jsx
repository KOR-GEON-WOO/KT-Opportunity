import Search from "./Search";
import Candidates from "./Candidates";
import Recommendation from "./Recommendation";
import PriorityCard from "../components/PriorityCard";
import ApprovalPanel from "../components/ApprovalPanel";
import LoadingStep from "../components/LoadingStep";
import ErrorState from "../components/ErrorState";
import { useSalesAgent } from "../hooks/useSalesAgent";

const STEPS = [
  { id: 1, label: "조건 입력", code: "F-01" },
  { id: 2, label: "후보 조회", code: "F-02" },
  { id: 3, label: "설치 확인", code: "F-03" },
  { id: 4, label: "우선순위", code: "F-04" },
  { id: 5, label: "AI 추천", code: "F-05" },
  { id: 6, label: "승인 · 저장", code: "F-06" },
];

export default function Dashboard() {
  const agent = useSalesAgent();

  if (agent.loading) {
    return (
      <div className="page-width">
        <ResponsiveStepBar step={agent.step} />
        <LoadingStep
          title={agent.loading.title}
          detail={agent.loading.detail}
          stages={agent.loading.stages}
          stageIndex={agent.loading.stageIndex}
          itemIndex={agent.loading.itemIndex}
          itemTotal={agent.loading.itemTotal}
          itemName={agent.loading.itemName}
        />
      </div>
    );
  }

  return (
    <div className="page-width">
      <ResponsiveStepBar step={agent.step} />
      <div className="kt-sweep" key={`sweep-${agent.step}`} />

      {agent.error && (
        <ErrorState
          title={agent.error.title}
          message={agent.error.message}
          kind={agent.error.kind ?? "error"}
          onRetry={agent.retry}
          onBack={
            agent.error.retryAction === "search" ||
            agent.error.retryAction === "edit"
              ? () => {
                  agent.clearError();
                  agent.setStep(1);
                }
              : undefined
          }
        />
      )}

      {!agent.error && agent.step === 1 && (
        <Search
          value={agent.conditions}
          onChange={agent.setConditions}
          onInterpret={agent.interpretConditions}
          onSearch={agent.searchCandidates}
          structuredConditions={agent.structuredConditions}
          conditionsDirty={agent.conditionsDirty}
        />
      )}

      {!agent.error && agent.step === 2 && (
        <Candidates
          mode="list"
          candidates={agent.candidates}
          onBack={() => agent.setStep(1)}
          onNext={() => agent.setStep(3)}
        />
      )}

      {!agent.error && agent.step === 3 && (
        <Candidates
          mode="install"
          candidates={agent.candidates}
          onChange={agent.setCandidates}
          onBack={() => agent.setStep(2)}
          onNext={agent.handlePriority}
        />
      )}

      {!agent.error && agent.step === 4 && (
        <section className="workspace-panel page-enter">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">F-04 · 방문 우선순위</span>
              <h1>PASS 후보 우선순위</h1>
              <p>
                세대수 최대 60점 + 건물 연식 최대 40점의 규칙 기반 점수입니다.
              </p>
            </div>
            <div className="count-badge">{agent.rankedCandidates.length}개 PASS</div>
          </div>

          <div className="priority-list">
            {agent.rankedCandidates.map((candidate, index) => (
              <div
                key={candidate.candidateId}
                className="stagger-item"
                style={{ "--delay": `${index * 70}ms` }}
              >
                <PriorityCard
                  candidate={candidate}
                  selected={
                    candidate.candidateId === agent.selectedCandidate?.candidateId
                  }
                  onSelect={agent.setSelectedCandidateId}
                />
              </div>
            ))}
          </div>

          <div className="action-row">
            <button
              className="secondary-button"
              type="button"
              onClick={() => agent.setStep(3)}
            >
              설치 상태 수정
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!agent.rankedCandidates.length}
              onClick={agent.createRecommendations}
            >
              AI 추천 생성
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

      {!agent.error &&
        agent.step === 5 &&
        agent.selectedRecommendation && (
          <>
            <div className="candidate-switcher page-enter">
              {agent.rankedCandidates.map((candidate) => (
                <button
                  type="button"
                  key={candidate.candidateId}
                  className={
                    agent.selectedCandidate?.candidateId === candidate.candidateId
                      ? "switcher-button active"
                      : "switcher-button"
                  }
                  onClick={() => agent.setSelectedCandidateId(candidate.candidateId)}
                >
                  <span>#{candidate.priorityRank}</span>
                  {candidate.buildingName}
                </button>
              ))}
            </div>

            <Recommendation
              recommendation={agent.selectedRecommendation}
              onBack={() => agent.setStep(4)}
              onNext={() => agent.setStep(6)}
            />
          </>
        )}

      {!agent.error && agent.step === 6 && (
        <ApprovalPanel
          candidates={agent.rankedCandidates}
          recommendations={agent.recommendations}
          saving={agent.saving}
          savedResult={agent.savedResult}
          onBack={() => agent.setStep(5)}
          onApprove={agent.approveAndSave}
          onReset={agent.resetWorkflow}
        />
      )}
    </div>
  );
}

function ResponsiveStepBar({ step }) {
  const current = STEPS.find((item) => item.id === step);

  return (
    <>
      <div className="step-bar" aria-label="Agent 진행 단계">
        {STEPS.map((item) => (
          <div
            key={item.id}
            aria-current={item.id === step ? "step" : undefined}
            className={
              item.id === step
                ? "step-item current"
                : item.id < step
                  ? "step-item done"
                  : "step-item"
            }
          >
            <span className="step-circle">
              {item.id < step ? "✓" : item.id}
            </span>
            <div>
              <small>{item.code}</small>
              <strong>{item.label}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="mobile-step-header" aria-label="모바일 Agent 진행 단계">
        <div className="mobile-step-copy">
          <small>STEP {step} OF {STEPS.length}</small>
          <strong>{current?.label}</strong>
        </div>
        <div className="mobile-progress-track">
          <span style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </div>
      </div>
    </>
  );
}
