const BASE_URL = (import.meta.env.VITE_N8N_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error("VITE_N8N_BASE_URL이 설정되지 않았습니다.");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`n8n 요청 실패 (${response.status})`);
  }

  return response.json();
}

// 아래 경로는 프런트-오케스트레이터 계약 예시다.
// n8n Webhook 경로가 확정되면 이 파일만 맞추면 된다.
export const n8nApi = {
  login: (body) => request("/webhook/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/webhook/auth/logout", { method: "POST" }),
  interpretNaturalSearch: (body) => request("/webhook/restaurant/interpret", { method: "POST", body: JSON.stringify(body) }),
  searchRestaurants: (body) => request("/webhook/restaurant/search", { method: "POST", body: JSON.stringify(body) }),
  verifyStore: (body) => request("/webhook/restaurant/verify", { method: "POST", body: JSON.stringify(body) }),
  analyzeProducts: (body) => request("/webhook/restaurant/analyze", { method: "POST", body: JSON.stringify(body) }),
  generateProposal: (body) => request("/webhook/restaurant/proposal", { method: "POST", body: JSON.stringify(body) }),
  saveFollowUp: (body) => request("/webhook/restaurant/follow-up", { method: "POST", body: JSON.stringify(body) }),
  history: () => request("/webhook/restaurant/history"),
};
