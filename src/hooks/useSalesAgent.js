import { useMemo, useState } from "react";
import {
  fetchCandidates,
  generateRecommendation,
  interpretSearchConditions,
  saveApprovedCandidates,
} from "../services/mockApi";
import { calculatePriority } from "../utils/score";
import { initialSearchConditions } from "../data/mockData";

export function useSalesAgent() {
  const [step, setStep] = useState(1);
  const [conditions, setConditions] = useState(initialSearchConditions);
  const [structuredConditions, setStructuredConditions] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
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

  function clearError() {
    setError(null);
  }

  async function interpretConditions() {
    clearError();
    setLoading({
      mode: "search",
      title: "영업 조건을 해석하고 있습니다",
      detail: "자연어 요청을 구조화된 검색 조건으로 변환합니다.",
      stageIndex: 0,
      stages: [
        "자연어 조건 해석",
        "지역명 표준화",
        "검색 조건 검증",
      ],
    });

    try {
      const interpreted = await interpretSearchConditions(
        conditions,
        (stageIndex) =>
          setLoading((prev) => (prev ? { ...prev, stageIndex } : prev))
      );

      setStructuredConditions(interpreted);
      setConditions((prev) => ({
        ...prev,
        targetArea: interpreted.targetArea,
        minBuildingAge: interpreted.minBuildingAge,
        maxBuildingAge: interpreted.maxBuildingAge ?? "",
        minHouseholds: interpreted.minHouseholds,
        buildingTypes: interpreted.buildingTypes,
      }));

      setLoading(null);
      return interpreted;
    } catch (err) {
      setLoading(null);
      setError({
        title: "영업 조건을 해석하지 못했습니다",
        message: err.message || "조건 해석 중 오류가 발생했습니다.",
        retryAction: "interpret",
      });
      return null;
    }
  }

  async function searchCandidates() {
    clearError();

    if (!structuredConditions) {
      const interpreted = await interpretConditions();
      if (!interpreted) return;
    }

    const activeConditions = structuredConditions ?? {
      targetArea: conditions.targetArea,
      minBuildingAge: Number(conditions.minBuildingAge || 0),
      maxBuildingAge:
        conditions.maxBuildingAge === ""
          ? null
          : Number(conditions.maxBuildingAge),
      minHouseholds: Number(conditions.minHouseholds || 0),
      buildingTypes: conditions.buildingTypes,
    };

    setLoading({
      mode: "search",
      title: "영업 후보지를 찾고 있습니다",
      detail: "건축물 데이터를 조회하고 조건에 맞는 후보를 필터링합니다.",
      stageIndex: 0,
      stages: [
        "건축HUB 조회",
        "주거용 건물 필터링",
        "연식 · 세대수 조건 적용",
        "후보 목록 정리",
      ],
    });

    try {
      const result = await fetchCandidates(
        activeConditions,
        (stageIndex) =>
          setLoading((prev) => (prev ? { ...prev, stageIndex } : prev))
      );

      setCandidates(result);
      setLoading(null);

      if (result.length === 0) {
        setError({
          title: "조건에 맞는 후보가 없습니다",
          message:
            "연식, 세대수 또는 건물 유형 조건을 완화한 뒤 다시 검색해 주세요.",
          retryAction: "edit",
          kind: "empty",
        });
        return;
      }

      setStep(2);
    } catch (err) {
      setLoading(null);
      setError({
        title: "건축물 데이터를 불러오지 못했습니다",
        message: err.message || "건축HUB 조회 중 오류가 발생했습니다.",
        retryAction: "search",
      });
    }
  }

  function handlePriority() {
    clearError();
    const ranked = calculatePriority(candidates);
    setRankedCandidates(ranked);
    setSelectedCandidateId(ranked[0]?.candidateId ?? null);

    if (!ranked.length) {
      setError({
        title: "PASS 후보가 없습니다",
        message: "설치 가능 후보가 없어 AI 추천 단계로 진행할 수 없습니다.",
        retryAction: "verify",
        kind: "empty",
      });
      return;
    }

    setStep(4);
  }

  async function createRecommendations() {
    clearError();
    if (!rankedCandidates.length) return;

    setLoading({
      mode: "recommend",
      title: "AI 영업 준비자료를 생성하고 있습니다",
      detail: "Mi:dm 상품 매칭 후 HyperCLOVA X 상담 스크립트를 생성합니다.",
      stageIndex: 0,
      stages: [
        "Mi:dm 상품 유효성 확인",
        "상품 매칭 · 추천 근거 생성",
        "Gateway 모델 전환",
        "HyperCLOVA X 상담 스크립트 생성",
      ],
    });

    try {
      const result = [];
      for (const candidate of rankedCandidates) {
        const recommendation = await generateRecommendation(
          candidate,
          (stageIndex) =>
            setLoading((prev) => (prev ? { ...prev, stageIndex } : prev))
        );
        result.push(recommendation);
      }

      setRecommendations(result);
      setLoading(null);
      setStep(5);
    } catch (err) {
      setLoading(null);
      setError({
        title: "AI 추천 생성에 실패했습니다",
        message: err.message || "Local LLM 처리 중 오류가 발생했습니다.",
        retryAction: "recommend",
      });
    }
  }

  async function approveAndSave(saveApproved) {
    if (!saveApproved) return;
    clearError();
    setSaving(true);

    const now = new Date().toISOString();

    const payload = rankedCandidates.map((candidate) => {
      const recommendation = recommendations.find(
        (item) => item.candidateId === candidate.candidateId
      );

      return {
        ...candidate,
        visitDate: null,
        visitStatus: "PLANNED",
        consultationResult: null,
        recommendedProductCode:
          recommendation?.product?.productCode ?? null,
        notes: "",
        saveApproved: true,
        approvedAt: now,
        updatedAt: now,
      };
    });

    try {
      const result = await saveApprovedCandidates(payload);
      setSavedResult(result);
    } catch (err) {
      setError({
        title: "저장에 실패했습니다",
        message:
          err.message ||
          "방문 목록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        retryAction: "save",
      });
    } finally {
      setSaving(false);
    }
  }

  function retry() {
    const action = error?.retryAction;
    clearError();

    if (action === "interpret") return interpretConditions();
    if (action === "search") return searchCandidates();
    if (action === "recommend") return createRecommendations();
    if (action === "save") return approveAndSave(true);
    if (action === "edit") return setStep(1);
    if (action === "verify") return setStep(3);
  }

  return {
    step,
    setStep,
    conditions,
    setConditions,
    structuredConditions,
    candidates,
    setCandidates,
    rankedCandidates,
    selectedCandidateId,
    setSelectedCandidateId,
    selectedCandidate,
    recommendations,
    selectedRecommendation,
    loading,
    error,
    clearError,
    saving,
    savedResult,
    interpretConditions,
    searchCandidates,
    handlePriority,
    createRecommendations,
    approveAndSave,
    retry,
  };
}
