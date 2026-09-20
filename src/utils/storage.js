const WORKFLOW_KEY = "kt-restaurant-agent:workflow:v1";
const HISTORY_KEY = "kt-restaurant-agent:history:v1";
const AUTH_KEY = "kt-restaurant-agent:auth:v1";

function storage(type) {
  if (typeof window === "undefined") return null;
  try {
    return type === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function loadWorkflow() {
  try {
    const raw = storage("session")?.getItem(WORKFLOW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveWorkflow(value) {
  try {
    storage("session")?.setItem(WORKFLOW_KEY, JSON.stringify(value));
  } catch {
    // Demo storage is optional.
  }
}

export function clearWorkflow() {
  try {
    storage("session")?.removeItem(WORKFLOW_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function loadHistory() {
  try {
    const raw = storage("local")?.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertHistory(record) {
  const current = loadHistory();
  const next = [record, ...current.filter((item) => item.storeId !== record.storeId)];
  try {
    storage("local")?.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures.
  }
  return next;
}

export function loadAuthSession() {
  try {
    const raw = storage("session")?.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(value) {
  try {
    storage("session")?.setItem(AUTH_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

export function clearAuthSession() {
  try {
    storage("session")?.removeItem(AUTH_KEY);
    storage("session")?.removeItem(WORKFLOW_KEY);
  } catch {
    // Ignore storage failures.
  }
}
