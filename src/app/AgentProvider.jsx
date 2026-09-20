import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createDefaultVerification, createDemoVerification, createInitialSearchConditions } from '../data/mockData.js';
import { dataClient } from '../services/dataClient.js';
import { analyzeProductNeeds } from '../utils/rules.js';
import { clearFollowUpDraft, clearWorkflow, loadStoreStatuses, loadWorkflow, saveWorkflow } from '../utils/storage.js';
import { kstIsoNow } from '../utils/clock.js';
import { validateSearch, validateVerification } from '../utils/validation.js';

const AgentContext = createContext(null);

function comparableConditions(value) {
  const { naturalQuery: _ignore, ...rest } = value || {};
  return rest;
}

function sameConditions(a, b) {
  return JSON.stringify(comparableConditions(a)) === JSON.stringify(comparableConditions(b));
}

export function AgentProvider({ children }) {
  const restored = useMemo(() => loadWorkflow(), []);
  const persistedStatuses = useMemo(() => loadStoreStatuses(), []);
  const [conditions, setConditionsState] = useState(restored?.conditions ?? createInitialSearchConditions());
  const [lastExecutedConditions, setLastExecutedConditions] = useState(restored?.lastExecutedConditions ?? null);
  const [restaurants, setRestaurants] = useState(restored?.restaurants ?? []);
  const [selectedStoreId, setSelectedStoreId] = useState(restored?.selectedStoreId ?? null);
  const [verificationByStore, setVerificationByStore] = useState(restored?.verificationByStore ?? {});
  const [proposalByStore, setProposalByStore] = useState(restored?.proposalByStore ?? {});
  const [saveResultByStore, setSaveResultByStore] = useState(restored?.saveResultByStore ?? {});
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [searchNotice, setSearchNotice] = useState(null);

  const selectedStore = useMemo(
    () => restaurants.find((item) => item.storeId === selectedStoreId) ?? null,
    [restaurants, selectedStoreId]
  );

  const verification = useMemo(() => {
    if (!selectedStoreId) return createDefaultVerification();
    return verificationByStore[selectedStoreId] || persistedStatuses[selectedStoreId] || createDefaultVerification();
  }, [selectedStoreId, verificationByStore, persistedStatuses]);

  const liveAnalysis = useMemo(() => analyzeProductNeeds(verification), [verification]);
  const proposal = selectedStoreId ? proposalByStore[selectedStoreId] ?? null : null;
  const saveResult = selectedStoreId ? saveResultByStore[selectedStoreId] ?? null : null;
  const isSearchStale = Boolean(lastExecutedConditions && restaurants.length && !sameConditions(conditions, lastExecutedConditions));

  useEffect(() => {
    saveWorkflow({
      conditions,
      lastExecutedConditions,
      restaurants,
      selectedStoreId,
      verificationByStore,
      proposalByStore,
      saveResultByStore,
    });
  }, [conditions, lastExecutedConditions, restaurants, selectedStoreId, verificationByStore, proposalByStore, saveResultByStore]);

  const setConditions = useCallback((updater) => {
    setConditionsState((prev) => typeof updater === 'function' ? updater(prev) : updater);
    setSearchNotice(null);
  }, []);

  const updateCondition = useCallback((key, value) => {
    setConditionsState((prev) => ({ ...prev, [key]: value }));
    setSearchNotice(null);
  }, []);

  async function interpretSearch() {
    setError(null);
    setLoading({
      title: '검색 문장을 조건으로 바꾸고 있습니다',
      detail: '지역·업태를 구조화한 뒤 허용된 행정구역인지 검증합니다.',
      stageIndex: 0,
      stages: ['자연어 해석', '행정구역 검증', '검색 조건 반영'],
    });
    try {
      const next = await dataClient.interpretNaturalSearch(conditions, (stageIndex) => setLoading((prev) => prev ? { ...prev, stageIndex } : prev));
      setConditionsState(next);
      setSearchNotice('자연어 조건을 반영했습니다. 조회 버튼을 눌러 실제 결과를 갱신하세요.');
    } catch (err) {
      setError(err.message || '검색 문장을 해석하지 못했습니다.');
    } finally {
      setLoading(null);
    }
  }

  async function search() {
    setError(null);
    setSearchNotice(null);
    const errors = validateSearch(conditions);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return false;
    }

    setLoading({
      title: '신규 음식점을 조회하고 있습니다',
      detail: '기존 결과는 새 조회가 성공할 때까지 유지합니다.',
      stageIndex: 0,
      stages: ['지자체 코드 매핑', 'OpenAPI 조회', '정상 영업 필터', '인허가일 정렬'],
    });
    try {
      const result = await dataClient.searchRestaurants(conditions, (stageIndex) => setLoading((prev) => prev ? { ...prev, stageIndex } : prev));
      setRestaurants(result);
      setLastExecutedConditions({ ...conditions });
      if (!result.length) {
        setSelectedStoreId(null);
        setSearchNotice('조회는 정상 처리되었지만 조건에 맞는 음식점이 0건입니다.');
      } else {
        const stillExists = result.some((item) => item.storeId === selectedStoreId);
        if (!stillExists) setSelectedStoreId(result[0].storeId);
        setSearchNotice(`${result.length}건을 최신 인허가 순으로 불러왔습니다.`);
      }
      return true;
    } catch (err) {
      setError(`${err.message || '음식점 데이터 조회에 실패했습니다.'} 이전 조회 결과는 유지했습니다.`);
      return false;
    } finally {
      setLoading(null);
    }
  }

  function selectStore(storeId) {
    setSelectedStoreId(storeId);
    setError(null);
  }

  function updateVerification(key, value) {
    if (!selectedStoreId) return;
    setVerificationByStore((prev) => ({
      ...prev,
      [selectedStoreId]: { ...(prev[selectedStoreId] || persistedStatuses[selectedStoreId] || createDefaultVerification()), [key]: value },
    }));
    setProposalByStore((prev) => ({ ...prev, [selectedStoreId]: null }));
    setSaveResultByStore((prev) => ({ ...prev, [selectedStoreId]: null }));
  }

  function loadDemoVerification() {
    if (!selectedStoreId) return;
    setVerificationByStore((prev) => ({ ...prev, [selectedStoreId]: createDemoVerification() }));
    setError(null);
  }

  async function generateProposal() {
    if (!selectedStore) return false;
    setError(null);
    const errors = validateVerification(verification);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return false;
    }

    setLoading({
      title: '맞춤 제안을 준비하고 있습니다',
      detail: '직원 확인값을 저장하고 규칙 엔진 검증 후 AI 상담안을 생성합니다.',
      stageIndex: 0,
      stages: ['직원 확인 저장', '상품 규칙 검증', '상담 전략 생성', '상담 문구 생성'],
    });

    try {
      await dataClient.saveVerification(selectedStore, verification);
      setLoading((prev) => prev ? { ...prev, stageIndex: 1 } : prev);
      const analysis = await dataClient.runRuleAnalysis(selectedStore, verification);
      if (!analysis.recommend.length) {
        setError('현재 확인값에서는 바로 추천할 상품군이 없습니다. 추가 확인 항목을 먼저 점검해 주세요.');
        return false;
      }
      setLoading((prev) => prev ? { ...prev, stageIndex: 2 } : prev);
      const result = await dataClient.generateProposal(selectedStore, verification, analysis, (stageIndex) => {
        if (stageIndex >= 2) setLoading((prev) => prev ? { ...prev, stageIndex: Math.min(3, stageIndex) } : prev);
      });
      setProposalByStore((prev) => ({ ...prev, [selectedStoreId]: result }));
      return true;
    } catch (err) {
      setError(err.message || '맞춤 제안 생성에 실패했습니다.');
      return false;
    } finally {
      setLoading(null);
    }
  }

  async function saveFollowUp(form) {
    if (!selectedStore) return null;
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
      setSaveResultByStore((prev) => ({ ...prev, [selectedStoreId]: { ...result, payload } }));
      clearFollowUpDraft(selectedStoreId);
      return result;
    } catch (err) {
      setError(err.message || '상담 결과 저장에 실패했습니다.');
      return null;
    }
  }

  function startNewSearch() {
    clearWorkflow();
    setConditionsState(createInitialSearchConditions());
    setLastExecutedConditions(null);
    setRestaurants([]);
    setSelectedStoreId(null);
    setVerificationByStore({});
    setProposalByStore({});
    setSaveResultByStore({});
    setError(null);
    setSearchNotice(null);
  }

  const value = {
    conditions,
    setConditions,
    updateCondition,
    lastExecutedConditions,
    restaurants,
    selectedStore,
    selectedStoreId,
    selectStore,
    verification,
    updateVerification,
    loadDemoVerification,
    liveAnalysis,
    proposal,
    saveResult,
    loading,
    error,
    setError,
    searchNotice,
    isSearchStale,
    interpretSearch,
    search,
    generateProposal,
    saveFollowUp,
    startNewSearch,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const value = useContext(AgentContext);
  if (!value) throw new Error('useAgent must be used inside AgentProvider');
  return value;
}
