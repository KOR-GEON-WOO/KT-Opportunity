import { useState } from 'react'
import { canRevise } from '../../domain/mutations.js'
import { displayValue, FACT_LABELS } from '../../domain/search.js'

const states = { PENDING_REVIEW: '직원 검토 대기', APPROVED: '직원 승인', REJECTED: '직원 반려', SUPERSEDED: '이전 버전' }
export default function ProposalPanel({ proposals, evidence, onRevise, blockedIds, busy }) {
  const [selectedId, setSelectedId] = useState(null)
  const proposal = proposals.find(item => item.proposalId === selectedId) ?? proposals.at(-1)
  const next = proposals.find(item => item.parentProposalId === proposal.proposalId)
  return <div className="proposal-preview">
    <div className="section-heading"><p className="eyebrow">AI 상담안 초안 · 가상 예시</p><span className="tag info">{states[proposal.state]}</span></div>
    <div className="field proposal-selector"><label htmlFor="proposal-version">이번 세션의 제안</label><select id="proposal-version" value={proposal.proposalId} onChange={event => setSelectedId(event.target.value)}>{[...proposals].reverse().map(item => <option key={item.proposalId} value={item.proposalId}>{states[item.state]} · {item.proposalId}</option>)}</select></div>
    <p className="small identifier">제안 ID: {proposal.proposalId}</p>
    {proposal.parentProposalId && <p className="small identifier">이전 제안: {proposal.parentProposalId}</p>}
    <p className="small muted">생성 시각: {proposal.createdAt ?? '정보 미제공'}</p>
    {proposal.state === 'SUPERSEDED' && <p className="notice warning">이전 버전은 읽기만 가능해요.{next && <button className="text-button" onClick={() => setSelectedId(next.proposalId)}>연결된 새 제안 보기</button>}</p>}
    {proposal.warnings.map((warning, index) => <p className="notice warning" key={index}>{warning}</p>)}
    <h4>기회 요약</h4><p>{proposal.summary ?? '초안 요약이 제공되지 않았어요.'}</p>
    <h4>필요와 근거</h4>{proposal.needs.length ? proposal.needs.map((need, index) => <div key={index}><p>{need.description ?? '필요 설명 미제공'}</p>{need.evidenceRefs.filter(ref => evidence.some(item => item.evidenceId === ref)).map(ref => <a className="evidence-link" key={ref} href={`#evidence-${encodeURIComponent(ref)}`}>연결 근거 확인</a>)}</div>) : <p className="small muted">필요와 근거 참조가 제공되지 않았어요.</p>}
    <h4>선택 상품과 추천 이유</h4>
    {proposal.selectedProducts.length ? proposal.selectedProducts.map((product, index) => <div className="product-preview" key={index}><strong>{product.productName ?? '상품명 미제공'}</strong><p className="small">{product.productCode} · {product.category ?? '분류 미제공'}</p><p>{product.recommendationReason ?? '추천 이유 미제공'}</p>{product.variants.map((variant, i) => <dl className="variant-fees" key={i}><dt>옵션 {i + 1} · 월 요금</dt>{Object.entries(variant).map(([key, fee]) => <dd key={key}>{key[11] === '0' ? '무약정' : `${key[11]}년`}: {fee == null ? '미확인' : `${fee.toLocaleString('ko-KR')}원`}</dd>)}</dl>)}</div>) : <p className="small muted">선택 상품 정보가 없어요. 별도 상품 판정을 추정하지 않아요.</p>}
    <h4>상담 전략</h4><p>{proposal.salesStrategy ?? '전략이 제공되지 않았어요.'}</p>
    <h4>상담 포인트</h4>{proposal.consultationPoints.length ? <ul>{proposal.consultationPoints.map((point, index) => <li key={index}>{point}</li>)}</ul> : <p className="small muted">상담 포인트가 제공되지 않았어요.</p>}
    <h4>상담안</h4><p className="consultation-script">{proposal.consultationScript ?? '상담안이 제공되지 않았어요.'}</p>
    {proposal.submittedFacts && <details className="submitted-facts"><summary>이 수정에 전달한 사실</summary><p className="small muted">이번 세션의 요청 내용이에요. 최신 매장 조회값은 아니에요.</p><dl>{Object.entries(proposal.submittedFacts).map(([key, value]) => <div key={key}><dt>{FACT_LABELS[key]}</dt><dd>{displayValue(value)}</dd></div>)}</dl></details>}
    {canRevise(proposal) && <button className="secondary revise-trigger" disabled={busy || blockedIds.includes(proposal.proposalId)} onClick={() => { setSelectedId(null); onRevise(proposal) }}>제안 수정 요청</button>}
    {blockedIds.includes(proposal.proposalId) && <p className="notice warning">최신 상태 확인이 필요해 수정 요청을 잠갔어요. 새로 조회할 서버 연결이 아직 없어요.</p>}
    <p className="small muted">실제 생성·저장·승인·상담 기록은 연결되지 않았어요.</p>
  </div>
}
