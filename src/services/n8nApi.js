const BASE_URL = (import.meta.env.VITE_N8N_BASE_URL || '').replace(/\/$/, '');

async function parseResponse(response) {
  if (response.status === 204) return {};
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('서버가 JSON이 아닌 응답을 반환했습니다. n8n Webhook 응답 형식을 확인해 주세요.');
  }
}

async function request(path, options = {}, timeoutMs = 15000) {
  if (!BASE_URL) throw new Error('VITE_N8N_BASE_URL이 설정되지 않았습니다.');

  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `n8n 요청 실패 (${response.status})`);
    }
    return await parseResponse(response);
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('요청 시간이 초과되었습니다. 네트워크 또는 Agent 상태를 확인해 주세요.');
    throw error;
  } finally {
    globalThis.clearTimeout(timer);
  }
}

const post = (path, body, timeoutMs) => request(path, { method: 'POST', body: JSON.stringify(body) }, timeoutMs);

export const n8nApi = {
  login: (body) => post('/webhook/auth/login', body, 10000),
  logout: () => request('/webhook/auth/logout', { method: 'POST' }, 10000),
  interpretNaturalSearch: (body) => post('/webhook/restaurant/interpret', body, 20000),
  searchRestaurants: (body) => post('/webhook/restaurant/search', body, 30000),
  verifyStore: (body) => post('/webhook/restaurant/verify', body, 15000),
  analyzeProducts: (body) => post('/webhook/restaurant/analyze', body, 15000),
  generateProposal: (body) => post('/webhook/restaurant/proposal', body, 120000),
  saveFollowUp: (body) => post('/webhook/restaurant/follow-up', body, 20000),
  history: () => request('/webhook/restaurant/history', {}, 20000),
};
