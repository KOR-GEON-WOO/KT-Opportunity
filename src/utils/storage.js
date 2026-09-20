const WORKFLOW_SESSION_KEY = "kt-sales-agent:workflow:v4";
const HISTORY_LOCAL_KEY = "kt-sales-agent:history:v1";

function getStorage(kind) {
  if (typeof window === "undefined") return null;

  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function loadWorkflowSnapshot() {
  const storage = getStorage("session");
  if (!storage) return null;

  try {
    const raw = storage.getItem(WORKFLOW_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveWorkflowSnapshot(snapshot) {
  const storage = getStorage("session");
  if (!storage) return;

  try {
    storage.setItem(WORKFLOW_SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage may be unavailable in privacy-restricted environments.
  }
}

export function clearWorkflowSnapshot() {
  const storage = getStorage("session");
  if (!storage) return;

  try {
    storage.removeItem(WORKFLOW_SESSION_KEY);
  } catch {
    // Ignore storage failures in demo mode.
  }
}

export function loadStoredHistory() {
  const storage = getStorage("local");
  if (!storage) return [];

  try {
    const raw = storage.getItem(HISTORY_LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertStoredHistory(rows) {
  const storage = getStorage("local");
  if (!storage) return rows;

  const previous = loadStoredHistory();
  const byCandidateId = new Map(
    previous.map((item) => [item.candidateId, item])
  );

  rows.forEach((item) => {
    const previousItem = byCandidateId.get(item.candidateId) ?? {};
    byCandidateId.set(item.candidateId, {
      ...previousItem,
      ...item,
    });
  });

  const merged = [...byCandidateId.values()].sort((a, b) =>
    String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""))
  );

  try {
    storage.setItem(HISTORY_LOCAL_KEY, JSON.stringify(merged));
  } catch {
    // The save API still returns success for the in-memory demo workflow.
  }

  return merged;
}
