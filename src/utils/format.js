export function formatDate(dateString) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateString));
}

export function formatNumber(value) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function statusLabel(status) {
  const labels = {
    PASS: "설치 가능",
    FAIL: "설치 불가",
    PLANNED: "방문 예정",
    VISITED: "방문 완료",
    CANCELLED: "방문 취소",
    SUCCESS: "상담 성공",
    HOLD: "보류",
  };

  return labels[status] ?? status ?? "미확인";
}
