import { useEffect, useMemo, useState } from "react";
import {
  defaultVerification,
  initialSearchConditions,
} from "../data/mockData";
import { dataClient } from "../services/dataClient";
import { kstIsoNow } from "../utils/format";
import { clearWorkflow, loadWorkflow, saveWorkflow } from "../utils/storage";
import { validateSearch, validateVerification } from "../utils/validation";

const STEP_LABELS = {
  1: "신규 음식점 후보 발굴",
  2: "영업 가능 매장 확인",
  3: "필요 상품 분석",
  4: "맞춤 상품 · 상담안",
  5: "상담 결과 · 후속관리",
};

export function useRestaurantAgent() {
  const restored = useMemo(() => loadWorkflow(), []);
  const [step, setStep] = useState(restored?.step ?? 1);
  const [conditions, setConditions] = useState(restored?.conditions ?? initialSearchConditions);
  const [restaurants, setRestaurants] = useState(restored?.restaurants ?? []);
  const [selectedStoreId, setSelectedStoreId] = useState(restored?.selectedStoreId ?? null);
  const [verification, setVerification] = useState(restored?.verification ?? defaultVerification);
  const [analysis, setAnalysis] = useState(restored?.analysis ?? null);
  const [proposal, setProposal] = useState(restored?.proposal ?? null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [saveResult, setSaveResult] = useState(restored?.saveResult ?? null);

  const selectedStore = useMemo(
    () => restaurants.find((item) => item.storeId === selectedStoreId) ?? null,
    [restaurants, selectedStoreId]
  );

  useEffect(() => {
    saveWorkflow({
      step,
      conditions,
      restaurants,
      selectedStoreId,
      verification,
      analysis,
      proposal,
      saveResult,
    });
  }, [step, conditions, restaurants, selectedStoreId, verification, analysis, proposal, saveResult]);

  function resetFromSearch() {
    setRestaurants([]);
    setSelectedStoreId(null);
    setVerification(defaultVerification);
    setAnalysis(null);
    setProposal(null);
    setSaveResult(null);
  }

  async function interpretSearch() {
    setError(null);
    setLoading({
      title: "검색 조건을 구조화하고 있습니다",
      detail: "HyperCLOVA X 역할을 PoC 규칙으로 시뮬레이션합니다.",
      stageIndex: 0,
      stages: ["자연어 조건 해석", "행정구역 매핑", "검색 파라미터 검증"],
    });
    try {
      const next = await dataClient.interpretNaturalSearch(conditions, (stageIndex) =>
        setLoading((prev) => ({ ...prev, stageIndex }))
      );
      setConditions(next);
    } catch (err) {
      setError(err.message || "검색 조건 해석에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  }

  async function search() {
    setError(null);
    const errors = validateSearch(conditions);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return;
    }

    resetFromSearch();
    setLoading({
      title: "최근 인허가 음식점을 조회하고 있습니다",
      detail: "LOCALDATA 일반음식점 /info 응답 스키마를 기준으로 수집합니다.",
      stageIndex: 0,
      stages: ["지자체 코드 매핑", "OpenAPI 조회", "영업/정상 필터", "인허가일 최신순 정렬"],
    });

    try {
      const result = await dataClient.searchRestaurants(conditions, (stageIndex) =>
        setLoading((prev) => ({ ...prev, stageIndex }))
      );
      setRestaurants(result);
      if (result.length === 0) {
        setError("조회 조건에 맞는 영업/정상 음식점이 없습니다. API 오류가 아니라 0건 결과입니다.");
      }
    } catch (err) {
      setError(err.message || "일반음식점 데이터 조회에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  }

  function selectStore(storeId) {
    setSelectedStoreId(storeId);
    setVerification(defaultVerification);
    setAnalysis(null);
    setProposal(null);
    setSaveResult(null);
    setStep(2);
  }

  async function confirmVerification() {
    setError(null);
    const errors = validateVerification(verification);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return;
    }
    await dataClient.saveVerification(selectedStore, verification);
    const result = await dataClient.runRuleAnalysis(selectedStore, verification);
    setAnalysis(result);
    setStep(3);
  }

  async function generateProposal() {
    if (!selectedStore || !analysis) return;
    if (analysis.recommend.length === 0) {
      setError("추천 가능한 상품군이 없습니다. 추가 확인 후 다시 진행하거나 후속관리 단계로 이동해 주세요.");
      return;
    }

    setError(null);
    setLoading({
      title: "매장 맞춤 상담안을 생성하고 있습니다",
      detail: "한 작업을 Lock한 상태로 HyperCLOVA X 분석 후 Mi:dm으로 교대 실행합니다.",
      stageIndex: 0,
      stages: ["HyperCLOVA X 조건 분석", "상담 전략 JSON 검증", "VRAM 반환 · 모델 전환", "Mi:dm 상담 문구 생성"],
    });

    try {
      const result = await dataClient.generateProposal(
        selectedStore,
        verification,
        analysis,
        (stageIndex) => setLoading((prev) => ({ ...prev, stageIndex }))
      );
      setProposal(result);
      setStep(4);
    } catch (err) {
      setError(err.message || "AI 상담안 생성에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  }

  function goToFollowUp() {
    setError(null);
    setStep(5);
  }

  async function saveFollowUp(form) {
    if (!selectedStore) return;
    setError(null);
    const now = kstIsoNow();
    const payload = {
      storeId: selectedStore.storeId,
      storeName: selectedStore.storeName,
      roadAddress: selectedStore.roadAddress,
      leadStatus: form.leadStatus,
      recommendedProductCodes: proposal?.products?.map((item) => item.productCode) ?? [],
      consultationStatus: form.consultationStatus,
      consultationResult: form.consultationResult || null,
      interestProducts: form.interestProducts,
      followUpDate: form.followUpDate || null,
      notes: form.notes.trim(),
      saveApproved: form.saveApproved,
      approvedAt: form.saveApproved ? now : null,
      updatedAt: now,
    };
    try {
      const result = await dataClient.saveFollowUp(payload);
      setSaveResult(result);
      return result;
    } catch (err) {
      setError(err.message || "저장에 실패했습니다.");
      return null;
    }
  }

  function newSearch() {
    clearWorkflow();
    setStep(1);
    setConditions(initialSearchConditions);
    resetFromSearch();
    setError(null);
  }

  return {
    step,
    stepLabel: STEP_LABELS[step],
    setStep,
    conditions,
    setConditions,
    restaurants,
    selectedStore,
    selectedStoreId,
    verification,
    setVerification,
    analysis,
    proposal,
    loading,
    error,
    setError,
    saveResult,
    interpretSearch,
    search,
    selectStore,
    confirmVerification,
    generateProposal,
    goToFollowUp,
    saveFollowUp,
    newSearch,
  };
}
