import {
  actualOpenStatusLabels,
  baseHistory,
  mockRestaurants,
  MOCK_DEMO_TODAY,
  regionOptions,
  verifiedProducts,
} from '../data/mockData.js';
import { analyzeProductNeeds } from '../utils/rules.js';
import { kstIsoNow } from '../utils/clock.js';
import { appendHistory, loadHistory, loadStoreStatuses, upsertStoreStatus } from '../utils/storage.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function detectRegion(query) {
  const hits = [];
  const topLevelMatchers = [
    ['충청남도', /충남|충청남도/],
    ['충청북도', /충북|충청북도/],
    ['대전광역시', /대전/],
    ['세종특별자치시', /세종/],
  ];
  topLevelMatchers.forEach(([region, regex]) => regex.test(query) && hits.push(region));
  const regionLevel1 = hits[0] || null;

  const childMatchers = [
    ['천안시', /천안/], ['아산시', /아산/], ['공주시', /공주/],
    ['청주시', /청주/], ['충주시', /충주/], ['제천시', /제천/],
    ['유성구', /유성구/], ['대덕구', /대덕구/], ['중구', /중구/], ['동구', /동구/], ['서구', /서구/],
    ['세종시', /세종시/],
  ];
  const childHits = childMatchers.filter(([, regex]) => regex.test(query)).map(([name]) => name);
  const regionLevel2 = childHits[0] || null;
  return { regionLevel1, regionLevel2 };
}

export async function interpretNaturalSearch(conditions, onStage) {
  onStage?.(0);
  await wait(180);
  const query = conditions.naturalQuery?.trim() ?? '';
  if (!query) throw new Error('자연어 검색 문장을 입력해 주세요.');

  const { regionLevel1, regionLevel2 } = detectRegion(query);
  const mentionsUnsupportedRegion = /(서울|경기|인천|강원|전라|전북|전남|광주|대구|부산|울산|경상|경북|경남|제주)/.test(query);
  if (mentionsUnsupportedRegion) {
    throw new Error('PoC 자연어 해석기가 지원하지 않는 지역입니다. 지역을 직접 선택해 주세요.');
  }

  if (!regionLevel1 && !regionLevel2) {
    throw new Error('지역을 명확하게 해석하지 못했습니다. 시·도와 시·군·구를 직접 선택해 주세요.');
  }

  let resolvedLevel1 = regionLevel1;
  if (!resolvedLevel1 && regionLevel2) {
    resolvedLevel1 = Object.entries(regionOptions).find(([, children]) => children.includes(regionLevel2))?.[0] || null;
  }
  const resolvedLevel2 = regionLevel2 || (resolvedLevel1 === conditions.regionLevel1 ? conditions.regionLevel2 : null);

  if (!resolvedLevel1 || !resolvedLevel2 || !regionOptions[resolvedLevel1]?.includes(resolvedLevel2)) {
    throw new Error('행정구역 조합을 검증할 수 없습니다. 검색 조건을 직접 확인해 주세요.');
  }

  onStage?.(1);
  await wait(140);

  const next = { ...conditions, regionLevel1: resolvedLevel1, regionLevel2: resolvedLevel2 };
  const typeMatch = query.match(/(한식|일식|중식|경양식|분식)/);
  if (typeMatch) next.businessType = typeMatch[1];

  onStage?.(2);
  await wait(120);
  return next;
}

export async function searchRestaurants(conditions, onStage) {
  onStage?.(0);
  await wait(160);
  onStage?.(1);
  await wait(160);

  const statuses = loadStoreStatuses();
  const result = mockRestaurants
    .filter((store) => store.regionLevel1 === conditions.regionLevel1)
    .filter((store) => store.regionLevel2 === conditions.regionLevel2)
    .filter((store) => store.permitDate >= conditions.permitDateFrom)
    .filter((store) => store.permitDate <= conditions.permitDateTo)
    .filter((store) => conditions.businessStatus ? store.businessStatus === conditions.businessStatus : true)
    .filter((store) => !conditions.businessType || conditions.businessType === '전체' ? true : store.businessType === conditions.businessType)
    .filter((store) => conditions.storeNameKeyword ? store.storeName.includes(conditions.storeNameKeyword.trim()) : true)
    .map((store) => statuses[store.storeId] ? { ...store, verification: statuses[store.storeId] } : store)
    .sort((a, b) => b.permitDate.localeCompare(a.permitDate));

  onStage?.(2);
  await wait(100);
  onStage?.(3);
  await wait(80);
  return structuredClone(result);
}

export async function fetchStoreStatus(storeId) {
  await wait(60);
  return loadStoreStatuses()[storeId] || null;
}

export async function saveVerification(store, verification) {
  await wait(120);
  const status = { ...verification, storeId: store.storeId, storeName: store.storeName, updatedAt: kstIsoNow() };
  upsertStoreStatus(store.storeId, status);
  return status;
}

export async function runRuleAnalysis(verification) {
  await wait(100);
  return analyzeProductNeeds(verification);
}

function productIsValid(product, date = MOCK_DEMO_TODAY) {
  return product.validFrom <= date && date <= product.validTo;
}

export async function fetchProductCatalog() {
  await wait(90);
  return structuredClone(verifiedProducts);
}

export async function generateProposal(store, verification, analysis, onStage) {
  onStage?.(0);
  await wait(260);

  const recommendedCategories = new Set(analysis.recommend.map((item) => item.category));
  const products = verifiedProducts.filter((product) => recommendedCategories.has(product.productCategory) && productIsValid(product));
  const catalogMissing = analysis.recommend
    .filter((item) => !products.some((product) => product.productCategory === item.category))
    .map((item) => ({ category: item.category, reason: '검수된 KT 상품 기준 데이터가 등록되지 않아 구체 상품을 생성하지 않습니다.' }));

  const area = store.area ?? store.facilitySize ?? null;
  const sizeSignal = area === null ? '매장 규모 추가 확인' : area >= 120 ? '중대형 매장' : area >= 70 ? '중형 매장' : '소형 매장';
  const priority = analysis.recommend.length >= 2 ? 'HIGH' : 'NORMAL';

  const strategy = {
    priority,
    prioritySource: 'DEMO_RULE',
    summary: `${store.businessType ?? '일반'} 업태 · ${sizeSignal} · 인허가일 ${store.permitDate} 기준으로 확인된 상태만 사용해 상담 순서를 구성했습니다.`,
    points: [
      `실제 개업 상태: ${actualOpenStatusLabels[verification.actualOpenStatus] || '확인 필요'}`,
      area ? `소재지 면적 ${area}㎡ 기반 사용 환경 확인` : '매장 면적 정보 추가 확인',
      `추천 후보 ${analysis.recommend.length}개 / 추가 확인 ${analysis.confirm.length}개`,
    ],
    additionalChecks: [
      ...analysis.confirm.map((item) => `${item.category}: ${item.reason}`),
      ...catalogMissing.map((item) => `${item.category}: ${item.reason}`),
    ],
  };

  onStage?.(1);
  await wait(220);
  onStage?.(2);
  await wait(180);

  const internetProduct = products.find((item) => item.productCategory === 'INTERNET');
  const script = [
    '안녕하세요. 신규 매장 운영 준비와 관련해 KT B2B 통신 환경을 함께 확인드리려고 방문했습니다.',
    `${store.storeName}의 현재 준비 상태를 기준으로 아직 결정되지 않은 통신·매장 운영 항목부터 확인드리겠습니다.`,
    internetProduct && verification.installStatus === 'PASS'
      ? `${internetProduct.productName}은 설치 가능 상태가 확인되어 실제 사용 환경과 가입 조건을 함께 확인해 보겠습니다.`
      : '확인되지 않은 가격이나 혜택은 임의로 안내하지 않고, 추가 확인이 필요한 항목부터 점검하겠습니다.',
  ];

  onStage?.(3);
  await wait(180);

  return {
    strategy,
    products,
    catalogMissing,
    script,
    generatedAt: kstIsoNow(),
    modelFlow: ['HyperCLOVA X SEED Think 14B', 'VRAM 반환 확인', 'KT Mi:dm 2.0'],
    validation: { schema: 'PASS', productCodes: 'PASS' },
  };
}

export async function saveFollowUp(payload) {
  await wait(160);
  if (payload.saveApproved !== true) throw new Error('직원의 최종 저장 승인이 필요합니다.');
  if (!payload.consultationId) throw new Error('상담 저장 요청 식별자가 없습니다.');
  appendHistory(payload);
  upsertStoreStatus(payload.storeId, {
    storeId: payload.storeId,
    storeName: payload.storeName,
    leadStatus: payload.leadStatus,
    consultationStatus: payload.consultationStatus,
    updatedAt: payload.updatedAt,
  });
  return { ok: true, savedAt: payload.updatedAt, consultationId: payload.consultationId };
}

export async function fetchHistory() {
  await wait(140);
  return [...loadHistory(), ...baseHistory].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
