export function getKstNow() {
  return new Date();
}

export function getKstToday(date = getKstNow()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function kstIsoNow(date = getKstNow()) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date).replace(' ', 'T');
  return `${parts}.${String(date.getMilliseconds()).padStart(3, '0')}+09:00`;
}

export function addDays(dateString, days) {
  const [y, m, d] = dateString.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function daysSinceKst(dateString, today = getKstToday()) {
  if (!dateString) return 0;
  const [y1, m1, d1] = dateString.split('-').map(Number);
  const [y2, m2, d2] = today.split('-').map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.max(0, Math.floor((b - a) / 86400000));
}
