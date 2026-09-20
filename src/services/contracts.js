function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function schemaError(label, detail) {
  throw new Error(`${label} 응답 형식이 올바르지 않습니다${detail ? `: ${detail}` : '.'}`);
}

function firstObject(...values) {
  return values.find((value) => isObject(value)) ?? null;
}

export function normalizeAuthResponse(raw) {
  const candidate = firstObject(raw?.session, raw?.data?.session, raw?.data, raw);
  if (!candidate) schemaError('로그인');
  if (candidate.authenticated === false || raw?.authenticated === false || raw?.data?.authenticated === false) {
    throw new Error('서버 인증에 실패했습니다.');
  }
  return {
    ...candidate,
    role: candidate.role || 'KT_SALES',
    authenticated: true,
    loggedInAt: candidate.loggedInAt || new Date().toISOString(),
  };
}

export function normalizeInterpretResponse(raw, current) {
  const candidate = firstObject(raw?.conditions, raw?.data?.conditions, raw?.data, raw);
  if (!candidate) schemaError('자연어 해석');
  if (!candidate.regionLevel1 || !candidate.regionLevel2) schemaError('자연어 해석', '지역 정보가 없습니다');
  if (!candidate.permitDateFrom || !candidate.permitDateTo) schemaError('자연어 해석', '조회 기간이 없습니다');
  return { ...current, ...candidate };
}

export function normalizeRestaurantSearchResponse(raw) {
  const candidate = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.data?.items)
        ? raw.data.items
        : null;

  if (!candidate) schemaError('음식점 조회', 'items 배열이 없습니다');

  return candidate.map((item, index) => {
    if (!isObject(item)) schemaError('음식점 조회', `${index + 1}번째 항목이 객체가 아닙니다`);
    if (!item.storeId) schemaError('음식점 조회', `${index + 1}번째 항목의 storeId가 없습니다`);
    if (!item.storeName) schemaError('음식점 조회', `${item.storeId}의 storeName이 없습니다`);
    if (!item.permitDate) schemaError('음식점 조회', `${item.storeId}의 permitDate가 없습니다`);
    return item;
  });
}

export function normalizeVerificationResponse(raw, fallback) {
  const candidate = firstObject(raw?.verification, raw?.data?.verification, raw?.statusData, raw?.data);
  if (!candidate) return fallback;
  return { ...fallback, ...candidate };
}

export function normalizeAnalysisResponse(raw) {
  const candidate = firstObject(raw?.analysis, raw?.data?.analysis, raw?.data, raw);
  if (!candidate) schemaError('상품 분석');
  for (const key of ['recommend', 'confirm', 'exclude']) {
    if (!Array.isArray(candidate[key])) schemaError('상품 분석', `${key} 배열이 없습니다`);
  }
  return candidate;
}

export function normalizeProposalResponse(raw) {
  const candidate = firstObject(raw?.proposal, raw?.data?.proposal, raw?.data, raw);
  if (!candidate) schemaError('맞춤 제안');
  if (!isObject(candidate.strategy)) schemaError('맞춤 제안', 'strategy가 없습니다');
  if (!Array.isArray(candidate.strategy.points)) schemaError('맞춤 제안', 'strategy.points 배열이 없습니다');
  if (!Array.isArray(candidate.strategy.additionalChecks)) schemaError('맞춤 제안', 'strategy.additionalChecks 배열이 없습니다');
  if (!Array.isArray(candidate.products)) schemaError('맞춤 제안', 'products 배열이 없습니다');
  if (!Array.isArray(candidate.script)) schemaError('맞춤 제안', 'script 배열이 없습니다');
  return candidate;
}

export function normalizeSaveResponse(raw) {
  const candidate = firstObject(raw?.result, raw?.data?.result, raw?.data, raw);
  if (!candidate) schemaError('상담 저장');
  return candidate;
}

export function normalizeHistoryResponse(raw) {
  const candidate = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.data?.items)
        ? raw.data.items
        : null;
  if (!candidate) schemaError('상담 이력', 'items 배열이 없습니다');
  return candidate;
}
