import { FACT_LABELS, SCHEMA } from './search.js'
import { ContractError, entityView, proposalView } from './adapter.js'

export const NUMBER_FACTS = ['tableCount', 'bundledProductsCount']
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const check = (ok, message) => { if (!ok) throw new ContractError(message) }
export const canRevise = proposal => ['PENDING_REVIEW', 'APPROVED'].includes(proposal?.state)

export function validatePatch(patch) {
  check(object(patch) && Object.keys(patch).length > 0, '변경한 사실을 하나 이상 입력해 주세요.')
  return Object.fromEntries(Object.entries(patch).map(([key, raw]) => {
    check(Object.hasOwn(FACT_LABELS, key), '허용되지 않은 Fact 필드예요.')
    const value = typeof raw === 'string' ? raw.trim() : raw
    check(value === 'UNKNOWN' || (NUMBER_FACTS.includes(key) ? typeof value === 'number' && Number.isFinite(value) && value >= 0 : key === 'internetCarrier' ? typeof value === 'string' && value.length > 0 : typeof value === 'boolean'), `${FACT_LABELS[key]} 값을 확인해 주세요.`)
    return [key, value]
  }))
}

// Empty input is invalid, never an implicit UNKNOWN or zero. Untouched fields are absent.
export function factsPreview(original, edits) {
  const patch = {}, errors = {}
  for (const [key, raw] of Object.entries(edits)) {
    let value = raw
    if (NUMBER_FACTS.includes(key) && raw !== 'UNKNOWN') value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN
    if (!NUMBER_FACTS.includes(key) && key !== 'internetCarrier' && raw !== 'UNKNOWN') value = raw === 'true' ? true : raw === 'false' ? false : raw
    try {
      const clean = validatePatch({ [key]: value })[key]
      if (!Object.is(original[key], clean)) patch[key] = clean
    } catch (error) { errors[key] = error.message }
  }
  return { patch, errors }
}

export function factsRequest(entity, patch) {
  check(typeof entity.entityId === 'string' && !!entity.entityId && typeof entity.searchExecutionId === 'string' && !!entity.searchExecutionId, '대상 매장과 검색 식별자가 필요해요.')
  return { schemaVersion: SCHEMA, entityId: entity.entityId, searchExecutionId: entity.searchExecutionId, facts: validatePatch(patch) }
}
export function reviewRequest(proposal, reviewNote, patch) {
  check(canRevise(proposal), '현재 상태에서는 수정할 수 없어요.')
  check(typeof reviewNote === 'string' && reviewNote.trim(), '수정 사유를 입력해 주세요.')
  check(typeof proposal.proposalId === 'string' && proposal.proposalId.trim(), '제안 식별자가 필요해요.')
  return { action: 'REVISE', proposalId: proposal.proposalId, payload: { reviewNote: reviewNote.trim(), ...(patch === undefined ? {} : { facts: validatePatch(patch) }) } }
}
export function mutationBody(input) {
  const raw = Array.isArray(input) && input.length === 1 ? input[0] : input
  check(object(raw) && raw.schemaVersion === SCHEMA, '변경 응답의 형식을 확인할 수 없어요.')
  if (raw.workflowStatus === 'ERROR') {
    const error = new Error(typeof raw.error?.message === 'string' ? raw.error.message : '변경 결과를 확인하지 못했어요.')
    error.code = typeof raw.error?.code === 'string' ? raw.error.code : 'MUTATION_ERROR'
    throw error
  }
  return raw
}
export function parseReviewResponse(input, old, existingIds = []) {
  const raw = mutationBody(input)
  check(raw.action === 'REVISE' && raw.proposalId === old.proposalId && raw.entityId === old.entityId, '수정 응답이 선택한 제안과 일치하지 않아요.')
  if (raw.workflowStatus === 'NEEDS_REVIEW') {
    check(raw.proposalReviewState === old.state && !raw.resultProposalId && !raw.newProposal && typeof raw.reviewId === 'string' && !!raw.reviewId, '무초안 응답의 이전 상태를 확인할 수 없어요.')
    return { kind: 'noDraft', message: '수정 요청 기록은 확인했지만 새 초안이 없어요. 기존 제안과 입력을 유지했어요.' }
  }
  check(raw.workflowStatus === 'COMPLETED' && raw.proposalReviewState === 'SUPERSEDED', '새 초안 생성 완료를 확인하지 못했어요.')
  const proposal = proposalView(raw.newProposal)
  check(proposal.proposalId === raw.resultProposalId && proposal.proposalId !== old.proposalId && !existingIds.includes(proposal.proposalId) && proposal.parentProposalId === old.proposalId && proposal.entityId === old.entityId && proposal.state === 'PENDING_REVIEW', '이전·새 제안 연결을 확인하지 못했어요.')
  check(typeof proposal.consultationScript === 'string' && !!proposal.consultationScript.trim(), '새 초안 본문이 불완전해요.')
  return { kind: 'revised', proposal }
}

// HUMAN_UPDATE returns the F02 summary. The endpoint wrapper still needs a LIVE capture.
export function parseFactsResponse(input, old, patch) {
  const raw = mutationBody(input)
  check(['COMPLETED', 'NEEDS_REVIEW'].includes(raw.workflowStatus) && raw.searchExecutionId === old.searchExecutionId && Array.isArray(raw.entities) && raw.entities.length === 1, '매장 보완 응답을 확인할 수 없어요.')
  const entity = entityView(raw.entities[0], old.searchExecutionId)
  check(entity.entityId === old.entityId && entity.resolutionStatus === old.resolutionStatus, '다른 매장 또는 일치 상태가 반환됐어요.')
  const expected = { ...old.facts, ...patch }
  check(Object.entries(expected).every(([key, value]) => Object.is(entity.facts[key], value)), '요청한 변경 또는 기존 사실이 보존되지 않았어요.')
  check(old.evidence.every(item => entity.evidence.some(next => JSON.stringify(next) === JSON.stringify(item))), '기존 근거가 보존되지 않았어요.')
  check(Object.entries(patch).every(([field, value]) => entity.evidence.some(item => item.source === 'HUMAN' && item.field === field && Object.is(item.value, value))), '직원 확인 근거가 응답에 없어요.')
  return { kind: 'facts', entity }
}

export function applyMutation(result, target, response) {
  // Response commits are scoped to the captured search and target, never the visible row.
  check(result.searchExecutionId === target.entity.searchExecutionId && result.entities.some(entity => entity.entityId === target.entity.entityId), '검색이 바뀌어 이전 응답을 적용하지 않았어요.')
  if (response.kind === 'facts') return { ...result, entities: result.entities.map(entity => entity.entityId === response.entity.entityId ? response.entity : entity) }
  if (response.kind !== 'revised') return result
  check(result.proposals.some(proposal => proposal.proposalId === target.proposal.proposalId && proposal.state === target.proposal.state), '선택한 제안 상태가 바뀌었어요.')
  check(!result.proposals.some(proposal => proposal.proposalId === response.proposal.proposalId), '이미 반영된 새 제안이에요.')
  return { ...result, proposals: [...result.proposals.map(proposal => proposal.proposalId === target.proposal.proposalId ? { ...proposal, state: 'SUPERSEDED' } : proposal), response.proposal] }
}
