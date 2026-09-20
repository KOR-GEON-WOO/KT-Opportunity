export function createConsultationId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const random = Math.random().toString(36).slice(2, 10);
  return `consult-${Date.now().toString(36)}-${random}`;
}
