const FORBIDDEN_INFERENCE_PORTS = new Set(['8000', '8001', '8080', '11434']);
const FORBIDDEN_INFERENCE_PATH = /\/(?:v1\/(?:chat\/completions|completions|models)|api\/(?:chat|generate))(?:\/|$)/i;

export function validateGatewayBaseUrl(rawUrl) {
  if (!rawUrl) return { ok: false, code: 'CONFIG', message: 'VITE_N8N_BASE_URL이 설정되지 않았습니다.' };

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, code: 'INVALID_GATEWAY', message: 'VITE_N8N_BASE_URL 형식이 올바르지 않습니다.' };
  }

  if (url.protocol !== 'https:') {
    return { ok: false, code: 'INSECURE_GATEWAY', message: 'VITE_N8N_BASE_URL은 인증된 HTTPS Gateway 주소만 허용합니다.' };
  }
  if (url.username || url.password) {
    return { ok: false, code: 'CREDENTIAL_IN_URL', message: 'Gateway URL에 인증정보를 포함할 수 없습니다.' };
  }
  if (url.search || url.hash) {
    return { ok: false, code: 'INVALID_GATEWAY', message: 'Gateway 기본 URL에는 query 또는 fragment를 포함할 수 없습니다.' };
  }
  if (FORBIDDEN_INFERENCE_PORTS.has(url.port)) {
    return { ok: false, code: 'DIRECT_INFERENCE_PORT', message: '브라우저에서 Local LLM 추론 포트로 직접 연결할 수 없습니다. 인증된 n8n HTTPS Gateway를 사용해 주세요.' };
  }
  if (FORBIDDEN_INFERENCE_PATH.test(url.pathname)) {
    return { ok: false, code: 'DIRECT_INFERENCE_PATH', message: '브라우저에서 OpenAI/Local LLM 추론 endpoint를 직접 지정할 수 없습니다. n8n Gateway 기본 주소를 사용해 주세요.' };
  }

  return { ok: true, url: url.toString().replace(/\/$/, '') };
}
