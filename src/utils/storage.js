const WORKFLOW_KEY = 'kt-restaurant-agent:workflow:v3';
const HISTORY_KEY = 'kt-restaurant-agent:consultation-history:v2';
const STORE_STATUS_KEY = 'kt-restaurant-agent:store-status:v2';
const AUTH_KEY = 'kt-restaurant-agent:auth:v2';
const DRAFT_KEY = 'kt-restaurant-agent:followup-drafts:v2';
const MAX_PERSISTED_RESULTS = 200;

function storage(type) {
  if (typeof window === 'undefined') return null;
  try {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readJson(type, key, fallback) {
  try {
    const raw = storage(type)?.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(type, key, value) {
  try {
    const target = storage(type);
    if (!target) return false;
    target.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] ${key} 저장 실패`, error);
    return false;
  }
}

export function loadWorkflow() {
  const value = readJson('session', WORKFLOW_KEY, null);
  if (!value || value.schemaVersion !== 3) return null;
  return value;
}

export function saveWorkflow(value) {
  const restaurants = Array.isArray(value.restaurants) ? value.restaurants : [];
  const omitResults = restaurants.length > MAX_PERSISTED_RESULTS;
  const snapshot = {
    schemaVersion: 3,
    ...value,
    restaurants: omitResults ? [] : restaurants,
    selectedStoreId: omitResults ? null : value.selectedStoreId,
    restaurantsOmitted: omitResults,
    omittedRestaurantCount: omitResults ? restaurants.length : 0,
  };
  return { ok: writeJson('session', WORKFLOW_KEY, snapshot), omittedResults: omitResults };
}

export function clearWorkflow() {
  try { storage('session')?.removeItem(WORKFLOW_KEY); } catch {}
}

export function loadHistory() {
  const value = readJson('local', HISTORY_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function appendHistory(record) {
  const current = loadHistory();
  if (record?.consultationId) {
    const existing = current.find((item) => item.consultationId === record.consultationId);
    if (existing) return current;
  }
  const next = [record, ...current];
  writeJson('local', HISTORY_KEY, next);
  return next;
}

export function loadStoreStatuses() {
  const value = readJson('local', STORE_STATUS_KEY, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function upsertStoreStatus(storeId, status) {
  const current = loadStoreStatuses();
  const next = { ...current, [storeId]: { ...(current[storeId] || {}), ...status } };
  writeJson('local', STORE_STATUS_KEY, next);
  return next[storeId];
}

export function loadFollowUpDraft(storeId) {
  if (!storeId) return null;
  const drafts = readJson('session', DRAFT_KEY, {});
  return drafts?.[storeId] || null;
}

export function saveFollowUpDraft(storeId, draft) {
  if (!storeId) return false;
  const drafts = readJson('session', DRAFT_KEY, {});
  return writeJson('session', DRAFT_KEY, { ...drafts, [storeId]: draft });
}

export function invalidateFollowUpDraftApproval(storeId) {
  if (!storeId) return;
  const drafts = readJson('session', DRAFT_KEY, {});
  if (!drafts?.[storeId]) return;
  writeJson('session', DRAFT_KEY, {
    ...drafts,
    [storeId]: { ...drafts[storeId], saveApproved: false },
  });
}

export function clearFollowUpDraft(storeId) {
  if (!storeId) return;
  const drafts = readJson('session', DRAFT_KEY, {});
  const next = { ...drafts };
  delete next[storeId];
  writeJson('session', DRAFT_KEY, next);
}

export function loadAuthSession() {
  return readJson('session', AUTH_KEY, null);
}

export function saveAuthSession(value) {
  return writeJson('session', AUTH_KEY, value);
}

export function clearAuthSession() {
  try {
    storage('session')?.removeItem(AUTH_KEY);
    storage('session')?.removeItem(WORKFLOW_KEY);
    storage('session')?.removeItem(DRAFT_KEY);
  } catch {}
}
