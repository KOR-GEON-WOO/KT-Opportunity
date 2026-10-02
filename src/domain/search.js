export const SCHEMA = 'KT-OPP-V1.0'
export const FACT_LABELS = {
  tableCount: '테이블 수', hasInternet: '인터넷 사용', hasLandline: '유선전화 사용',
  cctvRequired: 'CCTV 필요', needInternet: '인터넷 필요', internetCarrier: '인터넷 통신사',
  hasPos: 'POS 사용', backupLineNeeded: '백업 회선 필요', bundledProductsCount: '결합 상품 수',
}
export const RESOLUTIONS = {
  MATCH: { label: '매장 일치', tone: 'success' },
  NEEDS_REVIEW: { label: '확인 필요', tone: 'warning' },
  NO_MATCH: { label: '미일치', tone: 'neutral' },
}
export function displayValue(value) {
  if (value === 'UNKNOWN') return '미확인'
  if (value == null) return '정보 미제공'
  if (value === '') return '빈 값'
  if (value === false) return '없음'
  if (value === true) return '있음'
  return String(value)
}
export function kstDate(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}
export function kstTimestamp(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 23) + '+09:00'
}
export function weekRange(now = new Date()) {
  const end = kstDate(now)
  const start = new Date(end + 'T00:00:00Z')
  start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7)
  return { startDate: start.toISOString().slice(0, 10), endDate: end }
}
function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
}
export function validateConditions(values) {
  const errors = {}
  if (!values.city.trim()) errors.city = '시·도를 선택해 주세요.'
  if (!values.district.trim()) errors.district = '시·군·구를 입력해 주세요.'
  else if (!/^[가-힣]+(?:시|군|구)(?:\s+[가-힣]+구)?$/.test(values.district.trim())) errors.district = '영등포구 또는 천안시 서북구처럼 입력해 주세요.'
  if (!validDate(values.startDate)) errors.startDate = '유효한 시작일을 입력해 주세요.'
  if (!validDate(values.endDate)) errors.endDate = '유효한 종료일을 입력해 주세요.'
  if (!errors.startDate && !errors.endDate && values.startDate > values.endDate) errors.endDate = '종료일은 시작일과 같거나 이후여야 해요.'
  return errors
}
export function goalText(values) {
  return `${values.city} ${values.district.trim()} ${values.startDate}~${values.endDate} 신규 일반음식점 찾아줘`
}
export function searchRequest(values, now = new Date()) {
  if (Object.keys(validateConditions(values)).length) throw new Error('검색 조건을 확인해 주세요.')
  return { schemaVersion: SCHEMA, goalText: goalText(values), requestedAt: kstTimestamp(now) }
}
export function safeUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null } catch { return null }
}
