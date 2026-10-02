import { SCHEMA, kstTimestamp } from '../domain/search.js'
import { factsRequest, reviewRequest, parseFactsResponse, parseReviewResponse } from '../domain/mutations.js'

export const MUTATION_SCENARIOS = [
  ['success', '정상 반영'], ['noDraft', '요청 기록 후 새 초안 없음 (제안 수정)'],
  ['error', '처리 오류'], ['stale', '제안 상태 충돌'], ['missing', '대상 없음'],
  ['invalid', '불완전한 응답'], ['timeout', '응답 단절 · 결과 미확인'],
]
const failure = (code, message) => Object.assign(new Error(message), { code })

// Synthetic transport only. No fetch, webhook URL, staff identity, or browser credentials.
export function makeMutationFixture({ endpoint, body }, target, scenario = 'success', sequence = 1) {
  const { entity, proposal } = target
  if (['error', 'stale', 'missing'].includes(scenario)) return [{ schemaVersion: SCHEMA, workflowStatus: 'ERROR', action: body.action, proposalId: body.proposalId, error: {
    code: scenario === 'stale' ? 'F05_INVALID_STATE' : scenario === 'missing' ? endpoint === 'facts' ? 'F02_ENTITY_NOT_FOUND' : 'F05_PROPOSAL_NOT_FOUND' : endpoint === 'facts' ? 'F02_STORED_JSON_INVALID' : 'F05_STORED_JSON_INVALID',
    message: scenario === 'stale' ? '다른 상태로 처리된 제안이에요. 최신 상태 확인이 필요해요.' : scenario === 'missing' ? '대상 식별자를 확인하지 못했어요.' : '저장 원본을 읽지 못했어요. 기존 화면과 입력을 유지했어요.',
  }, httpStatus: scenario === 'stale' ? 409 : 400 }]
  if (endpoint === 'facts') {
    const rawEntity = { entityId: entity.entityId, searchExecutionId: entity.searchExecutionId, resolutionStatus: entity.resolutionStatus, storeProfile: entity.profile, facts: { ...entity.facts, ...body.facts }, evidenceList: [
      ...entity.evidence.map(item => ({ evidenceId: item.evidenceId, entityId: entity.entityId, field: item.field, normalizedValue: item.value, sourceName: item.source, status: item.status, collectedAt: item.collectedAt, sourceUrl: item.url, sourceRecordId: item.sourceRecordId })),
      ...Object.entries(body.facts).map(([field, value]) => ({ evidenceId: `EVI-HUMAN-DEMO-${sequence}-${field}`, entityId: entity.entityId, field, normalizedValue: value, sourceName: 'HUMAN', status: value === 'UNKNOWN' ? 'UNKNOWN' : 'CONFIRMED', collectedAt: kstTimestamp() })),
    ] }
    return [{ schemaVersion: SCHEMA, searchExecutionId: entity.searchExecutionId, workflowStatus: entity.resolutionStatus === 'NEEDS_REVIEW' ? 'NEEDS_REVIEW' : 'COMPLETED', entities: scenario === 'invalid' ? [] : [rawEntity] }]
  }
  const base = { schemaVersion: SCHEMA, action: 'REVISE', proposalId: proposal.proposalId, entityId: entity.entityId, reviewId: `REVIEW-DEMO-${sequence}`, httpStatus: 200 }
  if (scenario === 'noDraft') return [{ ...base, workflowStatus: 'NEEDS_REVIEW', proposalReviewState: proposal.state, downstreamResults: [], message: '수정 요청은 기록했지만 새 초안이 생성되지 않았습니다.' }]
  const resultProposalId = `${proposal.proposalId}-R${sequence}`
  const newProposal = {
    schemaVersion: SCHEMA, proposalId: resultProposalId, parentProposalId: proposal.proposalId, entityId: entity.entityId, searchExecutionId: entity.searchExecutionId,
    workflowStatus: 'COMPLETED', proposalSaved: true, proposalReviewState: 'PENDING_REVIEW',
    analysis: { opportunity: body.payload.facts ? '직원이 제공한 새 사실을 참고해 상담 질문을 준비하는 가상 초안이에요.' : '요청한 표현을 검토하기 위한 가상 초안이에요.' },
    salesStrategy: '확인된 사실과 미확인 항목을 구분하고, 실제 상품 조건은 별도로 확인합니다.',
    consultationPoints: ['수정 사유를 직원이 다시 검토해 주세요.', '실제 고객에게 전달하기 전 근거와 상품 조건을 확인해 주세요.'],
    consultationScript: `매장 운영에 필요한 연결 환경을 함께 확인해도 될까요?\n\n[데모 수정 사유] ${body.payload.reviewNote}`,
    selectedProducts: [], warnings: ['합성 응답입니다. 실제 AI 재생성·상품 판정·저장이 실행되지 않았습니다.'],
  }
  return [{ ...base, workflowStatus: 'COMPLETED', proposalReviewState: 'SUPERSEDED', resultProposalId, ...(scenario === 'invalid' ? {} : { newProposal }) }]
}

export function createMutationService({ mode = 'MOCK_FIXTURE', delayMs = 650, transport } = {}) {
  let active = false, sequence = 0
  return {
    async submit(target, { reviewNote = '', patch, scenario = 'success', existingIds = [] } = {}) {
      if (mode !== 'MOCK_FIXTURE') throw failure('LIVE_NOT_CONFIGURED', '실제 변경 연결이 준비되지 않았어요. 데모 성공으로 대체하지 않았어요.')
      if (active) throw failure('REQUEST_IN_PROGRESS', '이전 변경 응답을 기다려 주세요.')
      const endpoint = target.kind === 'facts' ? 'facts' : 'review'
      const body = endpoint === 'facts' ? factsRequest(target.entity, patch) : reviewRequest(target.proposal, reviewNote, patch)
      active = true
      try {
        sequence += 1
        await new Promise(resolve => setTimeout(resolve, delayMs))
        if (scenario === 'timeout') throw failure('OUTCOME_UNKNOWN', '응답이 끊겨 처리 여부를 확인할 수 없어요. 자동 재전송하지 않았어요.')
        const raw = await (transport ? transport({ endpoint, body }) : makeMutationFixture({ endpoint, body }, target, scenario, sequence))
        return endpoint === 'facts' ? parseFactsResponse(raw, target.entity, body.facts) : parseReviewResponse(raw, target.proposal, existingIds)
      } finally { active = false }
    },
  }
}

export function requiresRecheck(error) {
  return ['OUTCOME_UNKNOWN', 'CONTRACT_ERROR', 'F05_INVALID_STATE', 'F05_PROPOSAL_NOT_FOUND', 'F02_ENTITY_NOT_FOUND', 'F04_SAVE_FAILED', 'F05_SAVE_FAILED'].includes(error.code) || error.name === 'AbortError' || error instanceof TypeError
}
