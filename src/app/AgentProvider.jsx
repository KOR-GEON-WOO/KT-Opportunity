import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createDefaultVerification, createDemoVerification, createInitialSearchConditions, MOCK_DEMO_TODAY } from '../data/mockData.js';
import { dataClient, dataMode } from '../services/dataClient.js';
import { analyzeProductNeeds } from '../utils/rules.js';
import {
  clearFollowUpDraft,
  clearWorkflow,
  invalidateFollowUpDraftApproval,
  loadStoreStatuses,
  loadWorkflow,
  saveWorkflow,
} from '../utils/storage.js';
import { getKstToday, kstIsoNow } from '../utils/clock.js';
import { validateFollowUp, validateSearch, validateVerification } from '../utils/validation.js';

const AgentContext = createContext(null);
const VERIFICATION_FIELDS = ['actualOpenStatus', 'installStatus', 'internetStatus', 'wifiStatus', 'posStatus', 'cctvStatus'];

function initialConditions() {
  return createInitialSearchConditions(dataMode === 'mock' ? MOCK_DEMO_TODAY : getKstToday());
}

function comparableConditions(value) {
  const { naturalQuery: _ignore, ...rest } = value || {};
  return rest;
}

function sameConditions(a, b) {
  return JSON.stringify(comparableConditions(a)) === JSON.stringify(comparableConditions(b));
}

function needsHumanCheck(value) {
  if (!value) return true;
  return VERIFICATION_FIELDS.some((field) => !value[field] || value[field] === 'UNKNOWN');
}

function asStoredVerification(store, value) {
  if (!value) return null;
  return { ...value, storeId: store.storeId, storeName: store.storeName };
}

export function AgentProvider({ children }) {
  const restored = useMemo(() => loadWorkflow(), []);
  const statusLookupDone = useRef(new Set());
  const searchInFlight = useRef(false);
  const proposalInFlight = useRef(false);
  const saveInFlight = useRef(new Set());
  const locallyTouchedStores = useRef(new Set());
  const [storeStatuses, setStoreStatuses] = useState(() => loadStoreStatuses());
  const [conditions, setConditionsState] = useState(restored?.conditions ?? initialConditions());
  const [lastExecutedConditions, setLastExecutedConditions] = useState(restored?.lastExecutedConditions ?? null);
  const [restaurants, setRestaurants] = useState(restored?.restaurants ?? []);
  const [selectedStoreId, setSelectedStoreId] = useState(restored?.selectedStoreId ?? null);
  const [verificationByStore, setVerificationByStore] = useState(restored?.verificationByStore ?? {});
  const [proposalByStore, setProposalByStore] = useState(restored?.proposalByStore ?? {});
  const [saveResultByStore, setSaveResultByStore] = useState(restored?.saveResultByStore ?? {});
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [retryAction, setRetryAction] = useState(null);
  const [searchNotice, setSearchNotice] = useState(() => restored?.restaurantsOmitted
    ? `이전 대량 조회 ${restored.omittedRestaurantCount || ''}건은 브라우저 세션에 저장하지 않았습니다. 다시 조회해 주세요.`
    : null);
  const [persistenceWarning, setPersistenceWarning] = useState(null);

  const selectedStore = useMemo(
    () => restaurants.find((item) => item.storeId === selectedStoreId) ?? null,
    [restaurants, selectedStoreId]
  );

  const verification = useMemo(() => {
    if (!selectedStoreId) return createDefaultVerification();
    return verificationByStore[selectedStoreId] || storeStatuses[selectedStoreId] || createDefaultVerification();
  }, [selectedStoreId, verificationByStore, storeStatuses]);

  const liveAnalysis = useMemo(() => analyzeProductNeeds(verification), [verification]);
  const proposal = selectedStoreId ? proposalByStore[selectedStoreId] ?? null : null;
  const saveResult = selectedStoreId ? saveResultByStore[selectedStoreId] ?? null : null;
  const isSearchStale = Boolean(lastExecutedConditions && restaurants.length && !sameConditions(conditions, lastExecutedConditions));

  const dashboardSummary = useMemo(() => {
    const currentIds = new Set(restaurants.map((item) => item.storeId));
    const confirmationRequired = restaurants.filter((store) => {
      const value = verificationByStore[store.storeId] || storeStatuses[store.storeId] || null;
      return needsHumanCheck(value);
    }).length;
    const proposalReady = Object.entries(proposalByStore).filter(([storeId, value]) => currentIds.has(storeId) && Boolean(value)).length;
    const followUp = Object.entries(saveResultByStore).filter(([storeId, value]) => {
      if (!currentIds.has(storeId) || !value?.payload) return false;
      return Boolean(value.payload.followUpDate) || value.payload.leadStatus === 'FOLLOW_UP';
    }).length;
    return {
      discovered: restaurants.length,
      confirmationRequired,
      proposalReady,
      followUp,
      hasSearchRun: Boolean(lastExecutedConditions),
    };
  }, [restaurants, verificationByStore, storeStatuses, proposalByStore, saveResultByStore, lastExecutedConditions]);

  useEffect(() => {
    const result = saveWorkflow({
      conditions,
      lastExecutedConditions,
      restaurants,
      selectedStoreId,
      verificationByStore,
      proposalByStore,
      saveResultByStore,
    });
    if (!result.ok) {
      setPersistenceWarning('브라우저 임시저장 공간이 부족하거나 사용할 수 없습니다. 새로고침하면 현재 작업 일부가 복원되지 않을 수 있습니다.');
    } else if (result.omittedResults) {
      setPersistenceWarning(`조회 결과가 ${restaurants.length}건으로 많아 목록 전체는 세션에 저장하지 않습니다. 현재 화면에서는 계속 작업할 수 있습니다.`);
    } else {
      setPersistenceWarning(null);
    }
  }, [conditions, lastExecutedConditions, restaurants, selectedStoreId, verificationByStore, proposalByStore, saveResultByStore]);

  useEffect(() => {
    if (dataMode !== 'n8n' || !selectedStoreId || !selectedStore) return undefined;
    if (verificationByStore[selectedStoreId] || storeStatuses[selectedStoreId] || statusLookupDone.current.has(selectedStoreId)) return undefined;

    statusLookupDone.current.add(selectedStoreId);
    let active = true;
    dataClient.fetchStoreStatus(selectedStoreId)
      .then((status) => {
        if (!active || !status || locallyTouchedStores.current.has(selectedStoreId)) return;
        const next = asStoredVerification(selectedStore, status);
        setStoreStatuses((prev) => ({ ...prev, [selectedStoreId]: next }));
        setVerificationByStore((prev) => ({ ...prev, [selectedStoreId]: next }));
      })
      .catch((err) => {
        statusLookupDone.current.delete(selectedStoreId);
        if (active) setError(err.message || '기존 매장 확인 상태를 불러오지 못했습니다.');
      });
    return () => { active = false; };
  }, [selectedStoreId, selectedStore, verificationByStore, storeStatuses]);

  const clearErrorState = useCallback(() => {
    setError(null);
    setRetryAction(null);
  }, []);

  const setConditions = useCallback((updater) => {
    setConditionsState((prev) => typeof updater === 'function' ? updater(prev) : updater);
    setSearchNotice(null);
  }, []);

  const updateCondition = useCallback((key, value) => {
    setConditionsState((prev) => ({ ...prev, [key]: value }));
    setSearchNotice(null);
  }, []);

  async function interpretSearch() {
    clearErrorState();
    const stages = dataMode === 'n8n'
      ? ['서버 해석 요청', '응답 조건 검증']
      : ['자연어 해석', '행정구역 검증', '검색 조건 반영'];
    setLoading({
      title: '검색 문장을 조건으로 바꾸고 있습니다',
      detail: dataMode === 'n8n'
        ? '서버에서 구조화한 조건을 받은 뒤 프런트에서 필수 필드를 다시 검증합니다.'
        : '지역·업태를 구조화한 뒤 허용된 행정구역인지 검증합니다.',
      stageIndex: 0,
      stages,
    });
    try {
      const next = await dataClient.interpretNaturalSearch(conditions, (stageIndex) => setLoading((prev) => prev ? { ...prev, stageIndex } : prev));
      setConditionsState(next);
      setSearchNotice('자연어 조건을 반영했습니다. 조회 버튼을 눌러 실제 결과를 갱신하세요.');
    } catch (err) {
      setError(err.message || '검색 문장을 해석하지 못했습니다.');
      setRetryAction({ type: 'interpret', label: '조건 해석 다시 시도' });
    } finally {
      setLoading(null);
    }
  }

  async function search() {
    if (searchInFlight.current) return false;
    clearErrorState();
    setSearchNotice(null);
    const errors = validateSearch(conditions);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return false;
    }
    searchInFlight.current = true;

    const stages = dataMode === 'n8n'
      ? ['서버 조회 요청', '응답 스키마 검증']
      : ['지자체 코드 매핑', 'OpenAPI 조회', '정상 영업 필터', '인허가일 정렬'];
    setLoading({
      title: '신규 음식점을 조회하고 있습니다',
      detail: dataMode === 'n8n'
        ? 'OpenAPI 호출과 페이지 수집은 n8n에서 처리하며, 기존 결과는 새 조회가 성공할 때까지 유지합니다.'
        : '기존 결과는 새 조회가 성공할 때까지 유지합니다.',
      stageIndex: 0,
      stages,
    });
    try {
      const result = await dataClient.searchRestaurants(conditions, (stageIndex) => setLoading((prev) => prev ? { ...prev, stageIndex } : prev));
      setRestaurants(result);
      setLastExecutedConditions({ ...conditions });

      const inlineStatuses = {};
      for (const store of result) {
        if (store.verification) inlineStatuses[store.storeId] = asStoredVerification(store, store.verification);
      }
      if (Object.keys(inlineStatuses).length) {
        setStoreStatuses((prev) => ({ ...prev, ...inlineStatuses }));
        setVerificationByStore((prev) => {
          const next = { ...prev };
          for (const [storeId, status] of Object.entries(inlineStatuses)) {
            if (!locallyTouchedStores.current.has(storeId) && !prev[storeId]) next[storeId] = status;
          }
          return next;
        });
      }

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
      setRetryAction({ type: 'search', label: '음식점 조회 다시 시도' });
      return false;
    } finally {
      searchInFlight.current = false;
      setLoading(null);
    }
  }

  function selectStore(storeId) {
    setSelectedStoreId(storeId);
    clearErrorState();
  }

  function invalidateStoreProposal(storeId) {
    setProposalByStore((prev) => ({ ...prev, [storeId]: null }));
    setSaveResultByStore((prev) => ({ ...prev, [storeId]: null }));
    invalidateFollowUpDraftApproval(storeId);
  }

  function updateVerification(key, value) {
    if (!selectedStoreId) return;
    locallyTouchedStores.current.add(selectedStoreId);
    setVerificationByStore((prev) => {
      const base = prev[selectedStoreId] || storeStatuses[selectedStoreId] || createDefaultVerification();
      return {
        ...prev,
        [selectedStoreId]: {
          ...base,
          [key]: value,
          checkedAt: getKstToday(),
        },
      };
    });
    invalidateStoreProposal(selectedStoreId);
  }

  function loadDemoVerification() {
    if (!selectedStoreId) return;
    locallyTouchedStores.current.add(selectedStoreId);
    setVerificationByStore((prev) => ({ ...prev, [selectedStoreId]: createDemoVerification(dataMode === 'mock' ? MOCK_DEMO_TODAY : getKstToday()) }));
    invalidateStoreProposal(selectedStoreId);
    clearErrorState();
  }

  async function generateProposal() {
    if (!selectedStore || proposalInFlight.current) return false;
    clearErrorState();
    const verificationToSave = { ...verification, checkedAt: verification.checkedAt || getKstToday() };
    const errors = validateVerification(verificationToSave);
    if (Object.keys(errors).length) {
      setError(Object.values(errors)[0]);
      return false;
    }
    proposalInFlight.current = true;

    const stages = dataMode === 'n8n'
      ? ['직원 확인 저장', '상품 규칙 검증 (F-03)', 'F-04 순차 모델 파이프라인', '응답 스키마 검증']
      : ['직원 확인 저장', '상품 규칙 검증 (F-03)', 'F-04 순차 모델 파이프라인', '결과 검증'];
    setLoading({
      title: '맞춤 제안을 준비하고 있습니다',
      detail: dataMode === 'n8n'
        ? 'F-04는 n8n 단일 Queue에서 순차 실행됩니다. 브라우저는 서버가 전달하지 않은 내부 진행도를 임의로 추정하지 않습니다.'
        : '직원 확인값과 규칙 엔진 결과를 바탕으로 단일 Queue 모델 교대 흐름을 시뮬레이션합니다.',
      stageIndex: 0,
      stages,
      pipeline: [
        { label: 'HyperCLOVA X 분석 중', detail: '조건 해석 · 복합 판단 · 상담 전략' },
        { label: '모델 전환 중', detail: 'HyperCLOVA X VRAM 반환 확인 후 교대' },
        { label: 'KT Mi:dm 상담안 생성 중', detail: '검수 상품 기반 설명 · 상담 문구' },
      ],
      pipelineStageIndex: dataMode === 'mock' ? 0 : null,
    });

    try {
      const savedVerification = await dataClient.saveVerification(selectedStore, verificationToSave);
      const nextStoredStatus = {
        ...verificationToSave,
        ...savedVerification,
        storeId: selectedStore.storeId,
        storeName: selectedStore.storeName,
      };
      setStoreStatuses((prev) => ({ ...prev, [selectedStoreId]: nextStoredStatus }));
      setVerificationByStore((prev) => ({ ...prev, [selectedStoreId]: nextStoredStatus }));

      setLoading((prev) => prev ? { ...prev, stageIndex: 1 } : prev);
      const analysis = await dataClient.runRuleAnalysis(selectedStore, nextStoredStatus);
      if (!analysis.recommend.length) {
        setError('현재 확인값에서는 바로 추천할 상품군이 없습니다. 추가 확인 항목을 먼저 점검해 주세요.');
        return false;
      }

      setLoading((prev) => prev ? { ...prev, stageIndex: 2, pipelineStageIndex: dataMode === 'mock' ? 0 : null } : prev);
      const rawResult = await dataClient.generateProposal(selectedStore, nextStoredStatus, analysis, (pipelineStageIndex) => {
        setLoading((prev) => prev ? {
          ...prev,
          stageIndex: 2,
          pipelineStageIndex: dataMode === 'mock' ? Math.min(2, pipelineStageIndex) : null,
        } : prev);
      });
      setLoading((prev) => prev ? { ...prev, stageIndex: 3, pipelineStageIndex: dataMode === 'mock' ? 2 : null } : prev);
      const result = {
        ...rawResult,
        proposalVersion: rawResult.proposalVersion || rawResult.generatedAt || kstIsoNow(),
      };
      invalidateFollowUpDraftApproval(selectedStoreId);
      setProposalByStore((prev) => ({ ...prev, [selectedStoreId]: result }));
      return true;
    } catch (err) {
      const suffix = err?.code === 'TIMEOUT'
        ? ' F-04 작업은 서버에서 계속 진행 중일 수 있으므로 즉시 중복 실행하지 말고 Gateway 상태를 먼저 확인해 주세요.'
        : '';
      setError(`${err.message || '맞춤 제안 생성에 실패했습니다.'}${suffix}`);
      return false;
    } finally {
      proposalInFlight.current = false;
      setLoading(null);
    }
  }

  async function saveFollowUp(form) {
    if (!selectedStore) return null;
    clearErrorState();
    if (!form.saveApproved) {
      setError('저장 내용을 최종 확인해 주세요.');
      return null;
    }
    if (!form.consultationId) {
      setError('상담 저장 요청 식별자가 없습니다. 화면을 새로 열어 다시 시도해 주세요.');
      return null;
    }
    if (saveInFlight.current.has(form.consultationId)) {
      setError('동일 상담 저장 요청이 이미 처리 중입니다. 완료될 때까지 기다려 주세요.');
      return null;
    }
    const formErrors = validateFollowUp(form);
    if (Object.keys(formErrors).length) {
      setError(Object.values(formErrors)[0]);
      return null;
    }

    const now = kstIsoNow();
    const payload = {
      consultationId: form.consultationId,
      proposalVersion: form.proposalVersion || proposal?.proposalVersion || null,
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
      saveApproved: true,
      approvedAt: now,
      updatedAt: now,
    };
    saveInFlight.current.add(form.consultationId);
    try {
      const result = await dataClient.saveFollowUp(payload);
      if (result?.ok !== true) throw new Error('서버가 저장 성공을 확인하지 않았습니다.');
      setSaveResultByStore((prev) => ({ ...prev, [selectedStoreId]: { ...result, payload } }));
      setStoreStatuses((prev) => ({
        ...prev,
        [selectedStoreId]: {
          ...(prev[selectedStoreId] || {}),
          storeId: selectedStore.storeId,
          storeName: selectedStore.storeName,
          leadStatus: payload.leadStatus,
          consultationStatus: payload.consultationStatus,
          updatedAt: payload.updatedAt,
        },
      }));
      clearFollowUpDraft(selectedStoreId);
      return result;
    } catch (err) {
      setError(err.message || '상담 결과 저장에 실패했습니다.');
      return null;
    } finally {
      saveInFlight.current.delete(form.consultationId);
    }
  }

  function startNewSearch() {
    clearWorkflow();
    setConditionsState(initialConditions());
    setLastExecutedConditions(null);
    setRestaurants([]);
    setSelectedStoreId(null);
    setVerificationByStore({});
    setProposalByStore({});
    setSaveResultByStore({});
    clearErrorState();
    setSearchNotice(null);
    setPersistenceWarning(null);
    statusLookupDone.current.clear();
    locallyTouchedStores.current.clear();
  }

  async function retryLastAction() {
    const action = retryAction?.type;
    setRetryAction(null);
    if (action === 'interpret') return interpretSearch();
    if (action === 'search') return search();
    return false;
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
    retryAction,
    retryLastAction,
    searchNotice,
    persistenceWarning,
    isSearchStale,
    dashboardSummary,
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
