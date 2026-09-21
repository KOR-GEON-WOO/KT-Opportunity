import { daysSinceKst, kstIsoNow } from './clock.js';

export function formatDate(value) {
  if (!value) return '-';
  const parts = String(value).slice(0, 10).split('-');
  if (parts.length !== 3) return value;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatNumber(value, suffix = '') {
  if (value === null || value === undefined || value === '') return '-';
  return `${new Intl.NumberFormat('ko-KR').format(value)}${suffix}`;
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return '가격 데이터 미등록';
  return `${new Intl.NumberFormat('ko-KR').format(value)}원/월`;
}

export function daysSince(dateString, today) {
  return daysSinceKst(dateString, today);
}

export { kstIsoNow };
