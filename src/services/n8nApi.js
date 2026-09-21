import { validateGatewayBaseUrl } from './gatewayPolicy.js';
const BASE_URL = (import.meta.env.VITE_N8N_BASE_URL || '').replace(/\/$/, '');
const RETRYABLE_STATUS = new Set([408, 425, 429, 502, 503, 504]);
const MAX_SERVER_MESSAGE = 700;

export class ApiRequestError extends Error {
  constructor(message, { code = 'REQUEST_FAILED', status = null, retryable = false, path = '', timeoutMs = null, cause = null } = {}) {
    super(message);
    if (cause) this.cause = cause;
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.path = path;
    this.timeoutMs = timeoutMs;
  }
}

function emitAuthExpired() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('kt-auth-expired'));
  } catch {
    // Ignore event dispatch errors in non-browser environments.
  }
}

function sanitizeServerMessage(value) {
  if (typeof value !== 'string') return '';
  const normalized = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.length > MAX_SERVER_MESSAGE ? `${normalized.slice(0, MAX_SERVER_MESSAGE)}…` : normalized;
}

async function parseResponse(response) {
  if (response.status === 204) return {};
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiRequestError('서버가 JSON이 아닌 응답을 반환했습니다. n8n Webhook 응답 형식을 확인해 주세요.', {
      code: 'INVALID_JSON',
      status: response.status,
      retryable: false,
      cause,
    });
  }
}

const sleep = (ms) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

function isNetworkError(error) {
  return error instanceof TypeError && /fetch|network|failed/i.test(error.message || '');
}

function requestErrorFrom(error, { path, timeoutMs, timedOut }) {
  if (error instanceof ApiRequestError) return error;
  if (timedOut || error?.name === 'AbortError') {
    const seconds = Math.max(1, Math.round(timeoutMs / 1000));
    return new ApiRequestError(`요청이 ${seconds}초 안에 완료되지 않았습니다. 네트워크 또는 Agent Gateway 상태를 확인해 주세요.`, {
      code: 'TIMEOUT', path, timeoutMs, retryable: true, cause: error,
    });
  }
  if (isNetworkError(error)) {
    return new ApiRequestError('Agent Gateway에 연결할 수 없습니다. 네트워크 연결과 HTTPS Gateway 상태를 확인해 주세요.', {
      code: 'NETWORK', path, timeoutMs, retryable: true, cause: error,
    });
  }
  return error;
}

async function request(path, options = {}, policy = {}) {
  const gateway = validateGatewayBaseUrl(BASE_URL);
  if (!gateway.ok) throw new ApiRequestError(gateway.message, { code: gateway.code, path });

  const {
    timeoutMs = 15000,
    retries = 0,
    retryDelayMs = 700,
    retryLabel = '요청',
  } = policy;

  let attempt = 0;
  while (attempt <= retries) {
    const controller = new AbortController();
    let timedOut = false;
    const externalSignal = options.signal;
    const relayAbort = () => controller.abort(externalSignal?.reason);
    if (externalSignal) {
      if (externalSignal.aborted) relayAbort();
      else externalSignal.addEventListener('abort', relayAbort, { once: true });
    }
    const timer = globalThis.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      const { signal: _ignoredSignal, ...fetchOptions } = options;
      const response = await fetch(`${BASE_URL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...fetchOptions,
        signal: controller.signal,
      });

      if (response.status === 401 || response.status === 403) {
        emitAuthExpired();
        throw new ApiRequestError('로그인 세션이 만료되었거나 접근 권한이 없습니다. 다시 로그인해 주세요.', {
          code: 'AUTH', status: response.status, path, retryable: false,
        });
      }

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        const message = sanitizeServerMessage(body) || `n8n 요청 실패 (${response.status})`;
        throw new ApiRequestError(message, {
          code: `HTTP_${response.status}`,
          status: response.status,
          path,
          retryable: RETRYABLE_STATUS.has(response.status),
        });
      }
      return await parseResponse(response);
    } catch (rawError) {
      const error = requestErrorFrom(rawError, { path, timeoutMs, timedOut });
      const mayRetry = attempt < retries && error?.retryable === true && error?.code !== 'AUTH';
      if (!mayRetry) throw error;
      attempt += 1;
      await sleep(retryDelayMs * attempt);
      continue;
    } finally {
      globalThis.clearTimeout(timer);
      externalSignal?.removeEventListener?.('abort', relayAbort);
    }
  }

  throw new ApiRequestError(`${retryLabel}을 완료하지 못했습니다.`, { path, retryable: true });
}

const post = (path, body, policy) => request(path, { method: 'POST', body: JSON.stringify(body) }, policy);
const safeReadPolicy = (timeoutMs) => ({ timeoutMs, retries: 1, retryDelayMs: 650 });

export const n8nApi = {
  login: (body) => post('/webhook/auth/login', body, { timeoutMs: 10000 }),
  logout: () => request('/webhook/auth/logout', { method: 'POST' }, { timeoutMs: 10000 }),
  interpretNaturalSearch: (body) => post('/webhook/restaurant/interpret', body, { timeoutMs: 20000 }),
  searchRestaurants: (body) => post('/webhook/restaurant/search', body, { timeoutMs: 30000 }),
  // status/history/products are read-only operations. Only these receive one bounded automatic retry.
  getStoreStatus: (body) => post('/webhook/restaurant/status', body, safeReadPolicy(10000)),
  verifyStore: (body) => post('/webhook/restaurant/verify', body, { timeoutMs: 15000 }),
  analyzeProducts: (body) => post('/webhook/restaurant/analyze', body, { timeoutMs: 30000 }),
  // F-04 may already be running server-side after a client timeout. Never auto-retry this endpoint.
  generateProposal: (body) => post('/webhook/restaurant/proposal', body, { timeoutMs: 120000 }),
  // F-05 is mutation/idempotency-controlled by consultationId. UI retry remains explicit; no hidden retry here.
  saveFollowUp: (body) => post('/webhook/restaurant/follow-up', body, { timeoutMs: 20000 }),
  history: () => request('/webhook/restaurant/history', {}, safeReadPolicy(20000)),
  products: () => request('/webhook/restaurant/products', {}, safeReadPolicy(15000)),
};
