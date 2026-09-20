import { useMemo, useState } from "react";
import Search from "./Search";
import Candidates from "./Candidates";
import Recommendation from "./Recommendation";
import PriorityCard from "../components/PriorityCard";
import ApprovalPanel from "../components/ApprovalPanel";
import LoadingStep from "../components/LoadingStep";

import {
  fetchCandidates,
  generateRecommendation,
  interpretSearchConditions,
  saveApprovedCandidates,
} from "../services/mockApi";
import { calculatePriority } from "../utils/score";
import { initialSearchConditions } from "../data/mockData";

const STEPS = [
  { id: 1, label: "조건 입력", code: "F-01" },
  { id: 2, label: "후보 조회", code: "F-02" },
  { id: 3, label: "설치 확인", code: "F-03" },
  { id: 4, label: "우선순위", code: "F-04" },
  { id: 5, label: "AI 추천", code: "F-05" },
  { id: 6, label: "승인 · 저장", code: "F-06" },
];

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [conditions, setConditions] = useState(initialSearchConditions);
  const [structuredConditions, setStructuredConditions] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedResult, setSavedResult] = useState(null);

  const selectedCandidate = useMemo(
    () =>
      rankedCandidates.find(
        (candidate) => candidate.candidateId === selectedCandidateId
      ) ?? rankedCandidates[0],
    [rankedCandidates, selectedCandidateId]
  );

  const selectedRecommendation = useMemo(
    () =>
      recommendations.find(
        (item) => item.candidateId === selectedCandidate?.candidateId
      ) ?? recommendations[0],
    [recommendations, selectedCandidate]
  );

  async function handleSearch() {
    setLoading({
      title: "영업 조건을 해석하고 있습니다.",
      detail: "HyperCLOVA X 역할을 Mock API로 시뮬레이션합니다.",
    });

    const interpreted = await interpretSearchConditions(conditions);
    const result = await fetchCandidates();

    setStructuredConditions(interpreted);
    setCandidates(result);
    setLoading(null);
    setStep(2);
  }

  function handlePriority() {
    const ranked = calculatePriority(candidates);
    setRankedCandidates(ranked);
    setSelectedCandidateId(ranked[0]?.candidateId ?? null);
    setStep(4);
  }

  async function handleRecommendation() {
    if (!rankedCandidates.length) return;

    setLoading({
      title: "AI 영업 준비자료를 생성하고 있습니다.",
      detail: "Mi:dm 상품 매칭 후 HyperCLOVA X 상담 스크립트 생성을 순차 처리합니다.",
    });

    const result = [];
    for (const candidate of rankedCandidates) {
      result.push(await generateRecommendation(candidate));
    }

    setRecommendations(result);
    setLoading(null);
    setStep(5);
  }

  async function handleApprove(saveApproved) {
    if (!saveApproved) return;

    setSaving(true);

    const payload = rankedCandidates.map((candidate) => {
      const recommendation = recommendations.find(
        (item) => item.candidateId === candidate.candidateId
      );

      return {
        ...candidate,
        recommendedProductCode: recommendation?.product.productCode ?? null,
        saveApproved: true,
        approvedAt: new Date().toISOString(),
      };
    });

    const result = await saveApprovedCandidates(payload);
    setSavedResult(result);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="page-width">
        <StepBar step={step} />
        <LoadingStep title={loading.title} detail={loading.detail} />
      </div>
    );
  }

  return (
    <div className="page-width">
      <StepBar step={step} />

      {step === 1 && (
        <Search
          value={conditions}
          onChange={setConditions}
          onSubmit={handleSearch}
        />
      )}

      {step === 2 && (
        <>
          {structuredConditions && (
            <div className="structured-query">
              <span>Agent 해석 결과</span>
              <code>{JSON.stringify(structuredConditions)}</code>
            </div>
          )}
          <Candidates
            mode="list"
            candidates={candidates}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        </>
      )}

      {step === 3 && (
        <Candidates
          mode="install"
          candidates={candidates}
          onChange={setCandidates}
          onBack={() => setStep(2)}
          onNext={handlePriority}
        />
      )}

      {step === 4 && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">F-04 · 방문 우선순위</span>
              <h1>PASS 후보 우선순위</h1>
              <p>
                세대수 최대 60점 + 건물 연식 최대 40점으로 계산합니다.
              </p>
            </div>
            <div className="count-badge">{rankedCandidates.length}개 PASS</div>
          </div>

          {rankedCandidates.length ? (
            <div className="priority-list">
              {rankedCandidates.map((candidate) => (
                <PriorityCard
                  key={candidate.candidateId}
                  candidate={candidate}
                  selected={candidate.candidateId === selectedCandidate?.candidateId}
                  onSelect={setSelectedCandidateId}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              PASS 후보가 없어 AI 추천 단계로 진행할 수 없습니다.
            </div>
          )}

          <div className="action-row">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setStep(3)}
            >
              설치 상태 수정
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!rankedCandidates.length}
              onClick={handleRecommendation}
            >
              AI 추천 생성
            </button>
          </div>
        </section>
      )}

      {step === 5 && selectedRecommendation && (
        <>
          <div className="candidate-switcher">
            {rankedCandidates.map((candidate) => (
              <button
                type="button"
                key={candidate.candidateId}
                className={
                  selectedCandidate?.candidateId === candidate.candidateId
                    ? "switcher-button active"
                    : "switcher-button"
                }
                onClick={() => setSelectedCandidateId(candidate.candidateId)}
              >
                #{candidate.priorityRank} {candidate.buildingName}
              </button>
            ))}
          </div>

          <Recommendation
            recommendation={selectedRecommendation}
            onBack={() => setStep(4)}
            onNext={() => setStep(6)}
          />
        </>
      )}

      {step === 6 && (
        <ApprovalPanel
          candidates={rankedCandidates}
          recommendations={recommendations}
          saving={saving}
          savedResult={savedResult}
          onBack={() => setStep(5)}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
}

function StepBar({ step }) {
  return (
    <div className="step-bar" aria-label="Agent 진행 단계">
      {STEPS.map((item) => (
        <div
          key={item.id}
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
  );
}
