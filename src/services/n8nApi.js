const BASE_URL = import.meta.env.VITE_N8N_BASE_URL;

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error(
      "VITE_N8N_BASE_URL이 설정되지 않았습니다. 현재는 mockApi를 사용하세요."
    );
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`n8n 요청 실패: ${response.status}`);
  }

  return response.json();
}

export function submitSearchConditions(payload) {
  return request("/webhook/sales-agent/search", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitInstallStatus(payload) {
  return request("/webhook/sales-agent/install-status", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestRecommendation(payload) {
  return request("/webhook/sales-agent/recommend", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function approveAndSave(payload) {
  return request("/webhook/sales-agent/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
