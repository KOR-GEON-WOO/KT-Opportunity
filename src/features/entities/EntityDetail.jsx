import StatusTag from '../../components/StatusTag.jsx'
import { displayValue, FACT_LABELS, safeUrl } from '../../domain/search.js'
const sources = { MOIS_RESTAURANT: '일반음식점 인허가 자료', KAKAO: '카카오 장소 자료', SEMAS: '소상공인 상권 자료', HUMAN: '직원 확인' }
const fields = { businessName: '상호', name: '상호', roadAddress: '도로명 주소', address: '주소', phone: '전화번호', permitDate: '인허가일', businessStatus: '행정상 영업 상태' }
const outcomeLabels = { NO_CANDIDATE: '상품 후보 없음', NO_OPPORTUNITY: '연결 상품 없음', ERROR: '초안 처리 오류', NEEDS_REVIEW: '초안 확인 필요', COMPLETED: '초안 없음' }
const proposalStates = { PENDING_REVIEW: '직원 검토 대기', APPROVED: '직원 승인', REJECTED: '직원 반려', SUPERSEDED: '이전 버전' }
function Value({ value }) {
  if (value && typeof value === 'object') return <dl className="evidence-values">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{fields[key] ?? key}</dt><dd>{displayValue(item)}</dd></div>)}</dl>
  return <p>{displayValue(value)}</p>
}
export default function EntityDetail({ entity, proposal, outcome, onBack, headingRef }) {
  return <article className="detail-panel panel" aria-labelledby="entity-title">
    <button className="text-button mobile-back" onClick={onBack}>← 전체 매장 목록으로</button>
    <div className="detail-heading"><div className="section-heading"><span className="eyebrow">선택 매장 · 데모</span><StatusTag status={entity.resolutionStatus} /></div><h2 id="entity-title" tabIndex={-1} ref={headingRef}>{entity.profile.businessName ?? '상호 미제공'}</h2><p className="muted">{entity.profile.roadAddress ?? '주소 미제공'}</p></div>
    <div className="identity-grid"><div><span>인허가일</span><strong>{entity.profile.permitDate ?? '정보 미제공'}</strong></div><div><span>업종</span><strong>{entity.profile.industry === 'RESTAURANT' ? '일반음식점' : entity.profile.industry ?? '정보 미제공'}</strong></div><div><span>행정상 영업 상태</span><strong>{entity.profile.businessStatus === 'OPEN' ? '영업 (행정자료 기준)' : entity.profile.businessStatus ?? '정보 미제공'}</strong></div><div><span>전화번호</span><strong>{entity.profile.phone || '미확인'}</strong></div></div>
    <p className={`notice ${entity.resolutionStatus === 'MATCH' ? 'info' : 'warning'}`}>{entity.resolutionStatus === 'MATCH' ? '매장 일치는 동일 사업장에 대한 판단이에요. 현재 영업 여부나 상품 가입 가능성을 보장하지 않아요.' : entity.resolutionStatus === 'NO_MATCH' ? '일치하는 매장을 확인하지 못했어요. 초안 없이 원천 정보를 확인해 주세요.' : '출처의 상호·주소를 비교해 주세요. 확인이 필요한 매장에는 제안 초안을 생성하지 않았어요.'}</p>
    <section className="detail-section" aria-labelledby="facts-heading"><div className="section-heading"><h3 id="facts-heading">매장 정보 <span className="muted">Facts</span></h3><span className="small muted">미확인 ≠ 없음</span></div><dl className="facts-grid">{Object.entries(FACT_LABELS).map(([key, label]) => <div key={key}><dt>{label}</dt><dd className={entity.facts[key] === 'UNKNOWN' || entity.facts[key] == null ? 'muted' : ''}>{displayValue(entity.facts[key])}</dd></div>)}</dl><p className="small muted">합성 데이터예요. 사실 보완·수정은 후속 작업에서 연결합니다.</p></section>
    <section className="detail-section" aria-labelledby="evidence-heading"><div className="section-heading"><h3 id="evidence-heading">출처별 근거</h3><span className="small muted">{entity.evidence.length}개 출처 기록</span></div><p className="small muted">상충하는 값도 출처별로 유지합니다. 아래 자료는 모두 가상 표본이에요.</p>
      {entity.evidence.length ? entity.evidence.map(item => <details className="evidence-item" key={item.evidenceId} open><summary><span>{sources[item.source] ?? item.source ?? '출처 미제공'}</span><span className={`tag ${item.status === 'NEEDS_REVIEW' ? 'warning' : 'neutral'}`}>{item.status === 'CONFIRMED' ? '확인값 · 가상' : item.status === 'NEEDS_REVIEW' ? '출처 비교 필요' : item.status ?? '상태 미제공'}</span></summary><div className="evidence-content"><Value value={item.value} /><p className="small muted">수집 시각: {item.collectedAt ? item.collectedAt.replace('T', ' ').replace('+09:00', ' (한국 시간)') : '정보 미제공'}</p>{safeUrl(item.url) && <a href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer">출처 열기 (새 창)</a>}</div></details>) : <p className="notice neutral">현재 응답에 근거가 없어요.</p>}
    </section>
    <section className="detail-section" aria-labelledby="proposal-heading"><div className="section-heading"><h3 id="proposal-heading">제안 초안</h3>{proposal && <span className="tag info">{proposalStates[proposal.state]}</span>}</div>
      {proposal ? <div className="proposal-preview"><p className="eyebrow">AI 제안 형식의 가상 예시</p><p>{proposal.summary ?? '초안 요약이 제공되지 않았어요.'}</p>{proposal.warnings.map((warning, index) => <p className="small muted" key={index}>{warning}</p>)}<p className="small muted">초안 연결만 확인할 수 있어요. 검토·승인·상담은 아직 연결되지 않았어요.</p></div> : <p className={`notice ${outcome?.status === 'ERROR' ? 'error' : 'neutral'}`}>{outcome ? outcomeLabels[outcome.status] ?? '초안 결과 확인 필요' : '초안 없음'} · {outcome?.reason ?? (entity.resolutionStatus === 'MATCH' ? '현재 응답에 제안 초안이 없어요.' : '매장 정보를 먼저 확인해 주세요.')}</p>}
      <p className="small muted">상품별 후보·보류·제외 상세는 현재 응답에 제공되지 않았어요.</p>
    </section>
  </article>
}
