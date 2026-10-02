import { RESOLUTIONS } from '../domain/search.js'
export default function StatusTag({ status }) {
  const { label, tone } = RESOLUTIONS[status]
  return <span className={`tag ${tone}`}><span aria-hidden="true">{status === 'MATCH' ? '✓' : status === 'NEEDS_REVIEW' ? '!' : '−'}</span>{label}</span>
}
