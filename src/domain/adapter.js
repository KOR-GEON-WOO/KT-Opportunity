import { FACT_LABELS, RESOLUTIONS, SCHEMA } from './search.js'

export class ContractError extends Error {
  constructor(message) { super(message); this.name = 'ContractError'; this.code = 'CONTRACT_ERROR' }
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const requireValue = (condition, message) => { if (!condition) throw new ContractError(message) }
const text = (value, fallback = null) => typeof value === 'string' ? value : fallback
const id = value => typeof value === 'string' && value.trim().length > 0
const statuses = ['COMPLETED', 'NEEDS_REVIEW', 'ERROR', 'NO_CANDIDATE', 'NO_OPPORTUNITY']
const reviewStates = ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUPERSEDED']
function evidenceValue(value) {
  if (!object(value)) return ['string', 'number', 'boolean'].includes(typeof value) || value == null ? value : null
  // Project only displayable source values; scores and internal records stay outside the UI.
  const profile = object(value.top) ? value.top : value
  return Object.fromEntries(['businessName', 'name', 'roadAddress', 'address', 'phone', 'permitDate', 'businessStatus'].filter(key => profile[key] !== undefined).map(key => [key, profile[key]]))
}
export function entityView(entity, searchId) {
  requireValue(object(entity) && id(entity.entityId), '매장 식별자가 없어요.')
  requireValue(Object.hasOwn(RESOLUTIONS, entity.resolutionStatus), '알 수 없는 매장 상태예요.')
  requireValue(entity.searchExecutionId === searchId, '매장의 검색 식별자가 달라요.')
  requireValue(object(entity.storeProfile) && object(entity.facts) && Array.isArray(entity.evidenceList), '매장 정보의 형식을 확인해 주세요.')
  const facts = {}
  for (const key of Object.keys(FACT_LABELS)) {
    const value = entity.facts[key]
    if (value !== undefined) {
      requireValue(value === null || value === 'UNKNOWN' || (['tableCount', 'bundledProductsCount'].includes(key) ? typeof value === 'number' && Number.isFinite(value) && value >= 0 : key === 'internetCarrier' ? typeof value === 'string' : typeof value === 'boolean'), `Fact 형식 오류: ${key}`)
      facts[key] = value
    }
  }
  return {
    entityId: entity.entityId, searchExecutionId: searchId, resolutionStatus: entity.resolutionStatus,
    profile: Object.fromEntries(['businessName', 'industry', 'businessStatus', 'permitDate', 'roadAddress', 'phone'].map(key => [key, text(entity.storeProfile[key])])),
    facts,
    evidence: entity.evidenceList.map(item => {
      requireValue(object(item) && id(item.evidenceId) && item.entityId === entity.entityId, '근거와 매장 연결을 확인해 주세요.')
      return { evidenceId: item.evidenceId, field: text(item.field), value: evidenceValue(item.normalizedValue), source: text(item.sourceName), status: text(item.status), collectedAt: text(item.collectedAt), url: text(item.sourceUrl), sourceRecordId: text(item.sourceRecordId) }
    }),
  }
}
export function proposalView(result) {
  requireValue(object(result) && result.schemaVersion === SCHEMA && result.proposalSaved === true && result.workflowStatus === 'COMPLETED' && id(result.proposalId) && id(result.entityId) && id(result.searchExecutionId) && reviewStates.includes(result.proposalReviewState), '저장된 초안의 상태 또는 식별자가 잘못됐어요.')
  const strings = value => Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
  return {
    proposalId: result.proposalId, entityId: result.entityId, searchExecutionId: result.searchExecutionId,
    parentProposalId: text(result.parentProposalId), state: result.proposalReviewState,
    createdAt: text(result.createdAt), needs: Array.isArray(result.analysis?.needs) ? result.analysis.needs.filter(object).map(need => ({ needId: text(need.needId), description: text(need.description), category: text(need.needCategory), evidenceRefs: strings(need.evidenceRefs) })) : [],
    summary: text(result.analysis?.opportunity), salesStrategy: text(result.salesStrategy),
    consultationScript: text(result.consultationScript), consultationPoints: strings(result.consultationPoints), warnings: strings(result.warnings),
    selectedProducts: Array.isArray(result.selectedProducts) ? result.selectedProducts.filter(object).map(product => ({
      productCode: text(product.productCode), productName: text(product.productName), category: text(product.category), recommendationReason: text(product.recommendationReason),
      variants: Array.isArray(product.variants) ? product.variants.filter(object).map(variant => Object.fromEntries(Object.entries(variant).filter(([key, value]) => /^monthlyFee_[0-5]yr$/.test(key) && (value === null || typeof value === 'number' && Number.isFinite(value) && value >= 0)))) : [],
    })) : [],
  }
}
export function parseSearchResponse(input, dataOrigin) {
  requireValue(['MOCK_FIXTURE', 'RECORDED_FIXTURE', 'LIVE'].includes(dataOrigin), '데이터 출처가 필요해요.')
  const raw = Array.isArray(input) && input.length === 1 ? input[0] : input
  requireValue(object(raw), '지원하지 않는 응답 포장이에요.')
  requireValue(raw.schemaVersion === SCHEMA && id(raw.searchExecutionId), '응답 버전 또는 검색 식별자를 확인해 주세요.')
  if (raw.goalParseStatus && raw.goalParseStatus !== 'READY') {
    requireValue(['NEEDS_CONFIRMATION', 'UNSUPPORTED', 'ERROR'].includes(raw.goalParseStatus) && raw.apiExecutionAllowed === false, '입력 확인 응답의 형식이 달라요.')
    return { kind: raw.goalParseStatus === 'ERROR' ? 'error' : 'confirmation', dataOrigin, searchExecutionId: raw.searchExecutionId, message: text(raw.reason, '검색 조건을 확인해 주세요.'), code: text(raw.errorCode) }
  }
  requireValue(statuses.includes(raw.workflowStatus), '알 수 없는 업무 결과예요.')
  if (raw.workflowStatus === 'ERROR') return { kind: 'error', dataOrigin, searchExecutionId: raw.searchExecutionId, message: text(raw.reason, '조회 중 오류가 발생했어요. 조건을 유지했으니 다시 확인해 주세요.'), code: text(raw.errorCode) }
  requireValue(Array.isArray(raw.entities) && Array.isArray(raw.downstreamResults), '전체 매장 목록이 응답에 없어요. 0건 결과로 처리하지 않았어요.')
  const entities = raw.entities.map(entity => entityView(entity, raw.searchExecutionId))
  const entityIds = new Set(entities.map(entity => entity.entityId))
  requireValue(entityIds.size === entities.length, '중복 매장 식별자가 있어요.')
  // Server IDs are opaque: even __proto__ must be an ordinary lookup key.
  const proposals = [], outcomes = Object.create(null), warnings = [], proposalIds = new Set()
  for (const result of raw.downstreamResults) {
    requireValue(object(result) && entityIds.has(result.entityId), '초안 결과에 연결되지 않는 매장이 있어요.')
    requireValue(result.schemaVersion === SCHEMA && result.searchExecutionId === raw.searchExecutionId && statuses.includes(result.workflowStatus), '초안 결과의 계약이 달라요.')
    requireValue(typeof result.proposalSaved === 'boolean', '초안 저장 여부를 확인할 수 없어요.')
    requireValue(!Object.hasOwn(outcomes, result.entityId), '한 매장에 중복된 처리 결과가 있어요.')
    outcomes[result.entityId] = { status: result.workflowStatus, saved: result.proposalSaved, reason: text(result.reason), errorCode: text(result.errorCode) }
    if (result.proposalSaved) {
      requireValue(result.workflowStatus === 'COMPLETED' && id(result.proposalId) && reviewStates.includes(result.proposalReviewState), '저장된 초안의 상태 또는 식별자가 잘못됐어요.')
      requireValue(entities.find(entity => entity.entityId === result.entityId).resolutionStatus === 'MATCH', '일치하지 않은 매장에 초안이 연결됐어요.')
      requireValue(!proposalIds.has(result.proposalId), '중복 초안 식별자가 있어요.')
      proposalIds.add(result.proposalId)
      proposals.push(proposalView(result))
    }
  }
  const summary = { total: entities.length, match: entities.filter(e => e.resolutionStatus === 'MATCH').length, needsReview: entities.filter(e => e.resolutionStatus === 'NEEDS_REVIEW').length, noMatch: entities.filter(e => e.resolutionStatus === 'NO_MATCH').length }
  if (raw.summary && Object.keys(summary).some(key => raw.summary[key] !== summary[key])) warnings.push('서버 요약과 목록 수가 달라 전체 매장 목록을 기준으로 표시했어요.')
  return { kind: 'result', dataOrigin, searchExecutionId: raw.searchExecutionId, workflowStatus: raw.workflowStatus, completedThrough: text(raw.completedThrough), entities, proposals, outcomes, summary, warnings }
}
