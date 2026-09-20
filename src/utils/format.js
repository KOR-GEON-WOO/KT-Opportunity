export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${value}`.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatNumber(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "-";
  return `${new Intl.NumberFormat("ko-KR").format(value)}${suffix}`;
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return "가격 데이터 미등록";
  return `${new Intl.NumberFormat("ko-KR").format(value)}원/월`;
}

export function daysSince(dateString, now = new Date("2026-09-18T00:00:00+09:00")) {
  const date = new Date(`${dateString}T00:00:00+09:00`);
  const ms = Math.max(0, now.getTime() - date.getTime());
  return Math.floor(ms / 86400000);
}

export function kstIsoNow() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now).replace(" ", "T");
  return `${parts}.${String(now.getMilliseconds()).padStart(3, "0")}+09:00`;
}
