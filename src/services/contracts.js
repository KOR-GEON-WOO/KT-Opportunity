function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function schemaError(label, detail) {
  throw new Error(`${label} 응답 형식이 올바르지 않습니다${detail ? `: ${detail}` : '.'}`);
}

function firstObject(...values) {
  return values.find((value) => isObject(value)) ?? null;
}

function responseMessage(raw, fallback) {
  return raw?.error || raw?.message || raw?.data?.error || raw?.data?.message || fallback;
}

function responseStatus(raw) {
  const value = raw?.status ?? raw?.data?.status;
  return typeof value === 'string' ? value.toUpperCase() : null;
}

function ensureSuccess(raw, label, { allowNotFound = false } = {}) {
  if (Array.isArray(raw)) return;
  if (!isObject(raw)) schemaError(label);

  const status = responseStatus(raw);
  const failedStatus = new Set(['ERROR', 'FAIL', 'FAILED', 'UNAUTHORIZED', 'FORBIDDEN']);
  if (allowNotFound && status === 'NOT_FOUND') return;

  if (
    raw.ok === false ||
    raw.success === false ||
    raw.data?.ok === false ||
    raw.data?.success === false ||
    (status && failedStatus.has(status))
  ) {
    throw new Error(responseMessage(raw, `${label} 요청이 실패했습니다.`));
  }
}

function isDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isDateTimeString(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  return Number.isFinite(Date.parse(value));
}

function assertStringArray(value, label, { allowEmpty = true } = {}) {
  if (!Array.isArray(value)) schemaError(label, '배열이 아닙니다');
  if (!allowEmpty && value.length === 0) schemaError(label, '빈 배열입니다');
  value.forEach((item, index) => {
    if (typeof item !== 'string' || !item.trim()) schemaError(label, `${index + 1}번째 항목이 문자열이 아닙니다`);
  });
}

const PRODUCT_CATEGORIES = new Set(['INTERNET', 'WIFI', 'POS', 'CCTV']);
const OPEN_STATUSES = new Set(['OPEN', 'PREPARING', 'CLOSED', 'UNKNOWN']);
const INSTALL_STATUSES = new Set(['PASS', 'FAIL', 'UNKNOWN']);
const CONTRACT_STATUSES = new Set(['CONTRACTED', 'UNDECIDED', 'NOT_REQUIRED', 'UNKNOWN']);

function looksLikeVerification(value) {
  return isObject(value) && ['actualOpenStatus', 'installStatus', 'internetStatus', 'wifiStatus', 'posStatus', 'cctvStatus'].some((key) => key in value);
}

function validateVerification(candidate, label = '직원 확인') {
  if (!isObject(candidate)) schemaError(label);
  if (candidate.actualOpenStatus && !OPEN_STATUSES.has(candidate.actualOpenStatus)) schemaError(label, 'actualOpenStatus 값이 허용되지 않습니다');
  if (candidate.installStatus && !INSTALL_STATUSES.has(candidate.installStatus)) schemaError(label, 'installStatus 값이 허용되지 않습니다');
  for (const key of ['internetStatus', 'wifiStatus', 'posStatus', 'cctvStatus']) {
    if (candidate[key] && !CONTRACT_STATUSES.has(candidate[key])) schemaError(label, `${key} 값이 허용되지 않습니다`);
  }
  if (candidate.checkedAt && !isDateString(candidate.checkedAt)) schemaError(label, 'checkedAt 날짜 형식이 올바르지 않습니다');
  return candidate;
}

function validateProduct(product, index, label = '상품') {
  if (!isObject(product)) schemaError(label, `${index + 1}번째 항목이 객체가 아닙니다`);
  if (!product.productCode || typeof product.productCode !== 'string') schemaError(label, `${index + 1}번째 productCode가 없습니다`);
  if (!PRODUCT_CATEGORIES.has(product.productCategory)) schemaError(label, `${product.productCode}의 productCategory가 올바르지 않습니다`);
  if (!product.productName || typeof product.productName !== 'string') schemaError(label, `${product.productCode}의 productName이 없습니다`);
  if (product.monthlyFee != null && (!Number.isFinite(product.monthlyFee) || product.monthlyFee < 0)) schemaError(label, `${product.productCode}의 monthlyFee가 올바르지 않습니다`);
  if (product.validFrom && !isDateString(product.validFrom)) schemaError(label, `${product.productCode}의 validFrom이 올바르지 않습니다`);
  if (product.validTo && !isDateString(product.validTo)) schemaError(label, `${product.productCode}의 validTo가 올바르지 않습니다`);
  if (product.validFrom && product.validTo && product.validFrom > product.validTo) schemaError(label, `${product.productCode}의 유효기간 순서가 올바르지 않습니다`);
  if (product.eligibilityCondition != null && typeof product.eligibilityCondition !== 'string') schemaError(label, `${product.productCode}의 eligibilityCondition이 올바르지 않습니다`);
  if (product.benefit != null && typeof product.benefit !== 'string') schemaError(label, `${product.productCode}의 benefit이 올바르지 않습니다`);
  if (product.verifiedAt && !isDateString(product.verifiedAt)) schemaError(label, `${product.productCode}의 verifiedAt이 올바르지 않습니다`);
  return product;
}

export function normalizeAuthResponse(raw) {
  ensureSuccess(raw, '로그인');
  const candidate = firstObject(raw?.session, raw?.data?.session, raw?.data, raw);
  if (!candidate) schemaError('로그인');

  if (candidate.authenticated === false || raw?.authenticated === false || raw?.data?.authenticated === false) {
    throw new Error(responseMessage(raw, '서버 인증에 실패했습니다.'));
  }

  const authenticated = candidate.authenticated === true || raw?.authenticated === true || raw?.data?.authenticated === true;
  const explicitSuccess = raw?.ok === true || raw?.success === true || raw?.data?.ok === true || raw?.data?.success === true || responseStatus(raw) === 'OK';
  if (!authenticated && !explicitSuccess) {
    throw new Error('서버가 인증 성공 여부를 명시하지 않았습니다. 로그인 응답의 authenticated=true 또는 ok=true를 확인해 주세요.');
  }

  return {
    ...candidate,
    role: candidate.role || 'KT_SALES',
    authenticated: true,
    loggedInAt: candidate.loggedInAt || new Date().toISOString(),
  };
}

export function normalizeInterpretResponse(raw, current) {
  ensureSuccess(raw, '자연어 해석');
  const candidate = firstObject(raw?.conditions, raw?.data?.conditions, raw?.data, raw);
  if (!candidate) schemaError('자연어 해석');
  if (!candidate.regionLevel1 || !candidate.regionLevel2) schemaError('자연어 해석', '지역 정보가 없습니다');
  if (!candidate.permitDateFrom || !candidate.permitDateTo) schemaError('자연어 해석', '조회 기간이 없습니다');
  if (!isDateString(candidate.permitDateFrom) || !isDateString(candidate.permitDateTo)) schemaError('자연어 해석', '조회 기간 형식이 올바르지 않습니다');
  return { ...current, ...candidate };
}

export function normalizeRestaurantSearchResponse(raw) {
  ensureSuccess(raw, '음식점 조회');
  const candidate = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.data?.items)
        ? raw.data.items
        : null;

  if (!candidate) schemaError('음식점 조회', 'items 배열이 없습니다');

  const seen = new Set();
  return candidate.map((item, index) => {
    if (!isObject(item)) schemaError('음식점 조회', `${index + 1}번째 항목이 객체가 아닙니다`);
    if (!item.storeId || typeof item.storeId !== 'string') schemaError('음식점 조회', `${index + 1}번째 항목의 storeId가 없습니다`);
    if (seen.has(item.storeId)) schemaError('음식점 조회', `중복 storeId가 있습니다: ${item.storeId}`);
    seen.add(item.storeId);
    if (!item.storeName || typeof item.storeName !== 'string') schemaError('음식점 조회', `${item.storeId}의 storeName이 없습니다`);
    if (!isDateString(item.permitDate)) schemaError('음식점 조회', `${item.storeId}의 permitDate가 올바르지 않습니다`);
    if (item.verification != null) validateVerification(item.verification, `음식점 조회 ${item.storeId} verification`);
    return item;
  });
}

export function normalizeVerificationResponse(raw, fallback) {
  ensureSuccess(raw, '직원 확인 저장');
  const candidate = firstObject(raw?.verification, raw?.data?.verification, raw?.statusData, looksLikeVerification(raw?.data) ? raw.data : null, looksLikeVerification(raw) ? raw : null);
  if (!candidate) return fallback;
  return { ...fallback, ...validateVerification(candidate) };
}

export function normalizeStoreStatusResponse(raw) {
  ensureSuccess(raw, '매장 상태 조회', { allowNotFound: true });
  if (responseStatus(raw) === 'NOT_FOUND') return null;
  const candidate = firstObject(raw?.verification, raw?.data?.verification, raw?.statusData, looksLikeVerification(raw?.data) ? raw.data : null, looksLikeVerification(raw) ? raw : null);
  if (!candidate) return null;
  return validateVerification(candidate, '매장 상태 조회');
}

export function normalizeAnalysisResponse(raw) {
  ensureSuccess(raw, '상품 분석');
  const candidate = firstObject(raw?.analysis, raw?.data?.analysis, raw?.data, raw);
  if (!candidate) schemaError('상품 분석');
  const seenCategories = new Set();
  for (const key of ['recommend', 'confirm', 'exclude']) {
    if (!Array.isArray(candidate[key])) schemaError('상품 분석', `${key} 배열이 없습니다`);
    candidate[key].forEach((item, index) => {
      if (!isObject(item)) schemaError('상품 분석', `${key} ${index + 1}번째 항목이 객체가 아닙니다`);
      if (!PRODUCT_CATEGORIES.has(item.category)) schemaError('상품 분석', `${key} ${index + 1}번째 category가 올바르지 않습니다`);
      if (seenCategories.has(item.category)) schemaError('상품 분석', `${item.category}가 여러 판단 그룹에 중복되었습니다`);
      seenCategories.add(item.category);
      if (typeof item.reason !== 'string' || !item.reason.trim()) schemaError('상품 분석', `${key} ${index + 1}번째 reason이 없습니다`);
    });
  }
  return candidate;
}

export function normalizeProposalResponse(raw) {
  ensureSuccess(raw, '맞춤 제안');
  const candidate = firstObject(raw?.proposal, raw?.data?.proposal, raw?.data, raw);
  if (!candidate) schemaError('맞춤 제안');
  if (!isObject(candidate.strategy)) schemaError('맞춤 제안', 'strategy가 없습니다');
  assertStringArray(candidate.strategy.points, '맞춤 제안 strategy.points');
  assertStringArray(candidate.strategy.additionalChecks, '맞춤 제안 strategy.additionalChecks');
  if (typeof candidate.strategy.summary !== 'string' || !candidate.strategy.summary.trim()) schemaError('맞춤 제안', 'strategy.summary가 없습니다');
  if (!Array.isArray(candidate.products)) schemaError('맞춤 제안', 'products 배열이 없습니다');
  const seenProductCodes = new Set();
  candidate.products.forEach((product, index) => {
    validateProduct(product, index, '맞춤 제안 products');
    if (seenProductCodes.has(product.productCode)) schemaError('맞춤 제안', `중복 productCode가 있습니다: ${product.productCode}`);
    seenProductCodes.add(product.productCode);
  });
  if (candidate.catalogMissing != null) {
    if (!Array.isArray(candidate.catalogMissing)) schemaError('맞춤 제안', 'catalogMissing 배열이 아닙니다');
    candidate.catalogMissing.forEach((item, index) => {
      if (!isObject(item) || !PRODUCT_CATEGORIES.has(item.category) || typeof item.reason !== 'string') {
        schemaError('맞춤 제안', `catalogMissing ${index + 1}번째 항목이 올바르지 않습니다`);
      }
    });
  }
  assertStringArray(candidate.script, '맞춤 제안 script', { allowEmpty: false });
  if (candidate.generatedAt && !isDateTimeString(candidate.generatedAt)) schemaError('맞춤 제안', 'generatedAt 형식이 올바르지 않습니다');
  return candidate;
}

export function normalizeSaveResponse(raw) {
  ensureSuccess(raw, '상담 저장');
  const candidate = firstObject(raw?.result, raw?.data?.result, raw?.data, raw);
  if (!candidate) schemaError('상담 저장');
  if (candidate.ok === false || candidate.success === false) {
    throw new Error(responseMessage(candidate, '상담 결과를 저장하지 못했습니다.'));
  }
  const explicitSuccess = candidate.ok === true || candidate.success === true || responseStatus(raw) === 'OK' || raw?.ok === true || raw?.success === true;
  if (!explicitSuccess) schemaError('상담 저장', '저장 성공 여부가 명시되지 않았습니다');
  return { ...candidate, ok: true };
}

export function normalizeHistoryResponse(raw) {
  ensureSuccess(raw, '상담 이력');
  const candidate = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.data?.items)
        ? raw.data.items
        : null;
  if (!candidate) schemaError('상담 이력', 'items 배열이 없습니다');

  return candidate.map((item, index) => {
    if (!isObject(item)) schemaError('상담 이력', `${index + 1}번째 항목이 객체가 아닙니다`);
    if (!item.storeId || typeof item.storeId !== 'string') schemaError('상담 이력', `${index + 1}번째 storeId가 없습니다`);
    if (!item.storeName || typeof item.storeName !== 'string') schemaError('상담 이력', `${item.storeId}의 storeName이 없습니다`);
    if (!Array.isArray(item.interestProducts)) schemaError('상담 이력', `${item.storeId}의 interestProducts가 배열이 아닙니다`);
    item.interestProducts.forEach((category) => {
      if (!PRODUCT_CATEGORIES.has(category)) schemaError('상담 이력', `${item.storeId}의 interestProducts 값이 올바르지 않습니다`);
    });
    if (!isDateTimeString(item.updatedAt)) schemaError('상담 이력', `${item.storeId}의 updatedAt이 올바르지 않습니다`);
    if (item.followUpDate && !isDateString(item.followUpDate)) schemaError('상담 이력', `${item.storeId}의 followUpDate가 올바르지 않습니다`);
    return item;
  });
}

export function normalizeProductCatalogResponse(raw) {
  ensureSuccess(raw, '상품 기준');
  const candidate = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.data?.items)
        ? raw.data.items
        : null;
  if (!candidate) schemaError('상품 기준', 'items 배열이 없습니다');
  const seen = new Set();
  return candidate.map((product, index) => {
    validateProduct(product, index, '상품 기준');
    if (seen.has(product.productCode)) schemaError('상품 기준', `중복 productCode가 있습니다: ${product.productCode}`);
    seen.add(product.productCode);
    return product;
  });
}
