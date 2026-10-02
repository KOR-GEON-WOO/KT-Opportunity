import test from 'node:test'
import assert from 'node:assert/strict'
import { makeFixture } from '../src/services/fixtures.js'
import { parseSearchResponse, proposalView } from '../src/domain/adapter.js'
import { factsPreview, validatePatch, factsRequest, reviewRequest, parseReviewResponse, parseFactsResponse, applyMutation } from '../src/domain/mutations.js'
import { createMutationService, makeMutationFixture, requiresRecheck } from '../src/services/mutationService.js'

const conditions = { city: '서울특별시', district: '영등포구', startDate: '2026-10-01', endDate: '2026-10-03' }
const initial = () => parseSearchResponse(makeFixture('mixed', conditions), 'MOCK_FIXTURE')
function target(kind = 'review') { const result = initial(); return { kind, entity: result.entities[0], proposal: result.proposals[0] } }
const reviewFixture = (t, scenario = 'success') => makeMutationFixture({ endpoint: 'review', body: reviewRequest(t.proposal, '질문형으로 수정') }, t, scenario)

test('dirty-only patches preserve false/0/UNKNOWN/decimals and reject blank or invalid data', () => {
  const { facts } = target().entity
  assert.deepEqual(factsPreview(facts, { tableCount: '12', hasInternet: 'false', bundledProductsCount: '0' }), { patch: {}, errors: {} })
  assert.deepEqual(factsPreview(facts, { tableCount: '0', hasPos: 'false', internetCarrier: ' KT ', hasInternet: 'UNKNOWN' }).patch, { tableCount: 0, hasPos: false, internetCarrier: 'KT', hasInternet: 'UNKNOWN' })
  assert.equal(factsPreview(facts, { tableCount: '0.5' }).patch.tableCount, .5)
  for (const patch of [{ tableCount: '' }, { internetCarrier: ' ' }, { tableCount: '-1' }, { tableCount: 'Infinity' }]) assert.equal(Object.keys(factsPreview(facts, patch).errors).length, 1)
  for (const patch of [{}, { hasInternet: 'false' }, { hasInternet: null }, { tableCount: NaN }, { tableCount: -1 }, { resolutionStatus: 'MATCH' }, JSON.parse('{"__proto__":true}')]) assert.throws(() => validatePatch(patch))
})
test('requests use observed fields; expression omits facts and actor; FACTS is review only', async () => {
  const t = target(), calls = []
  const service = createMutationService({ delayMs: 0, transport: request => { calls.push(request); return makeMutationFixture(request, t) } })
  await service.submit(t, { reviewNote: '  짧게  ', patch: { hasInternet: true } })
  assert.deepEqual(calls, [{ endpoint: 'review', body: { action: 'REVISE', proposalId: t.proposal.proposalId, payload: { reviewNote: '짧게', facts: { hasInternet: true } } } }])
  assert.deepEqual(reviewRequest(t.proposal, '표현'), { action: 'REVISE', proposalId: t.proposal.proposalId, payload: { reviewNote: '표현' } })
  assert.deepEqual(Object.keys(factsRequest(t.entity, { tableCount: 0 })), ['schemaVersion', 'entityId', 'searchExecutionId', 'facts'])
  assert.throws(() => reviewRequest(t.proposal, ' '))
  for (const state of ['REJECTED', 'SUPERSEDED']) assert.throws(() => reviewRequest({ ...t.proposal, state }, '수정'))
  assert.equal(reviewRequest({ ...t.proposal, state: 'APPROVED' }, '수정').action, 'REVISE')
})
test('standalone HUMAN merge preserves unedited facts, profile, conflicts and resolution; no draft rewrite', async () => {
  const result = initial(), t = { kind: 'facts', entity: result.entities[1] }, patch = { tableCount: 0, hasInternet: false, internetCarrier: 'UNKNOWN' }, calls = []
  const service = createMutationService({ delayMs: 0, transport: request => { calls.push(request); return makeMutationFixture(request, t) } })
  const response = await service.submit(t, { patch })
  assert.equal(calls.length, 1); assert.equal(calls[0].endpoint, 'facts')
  const updated = applyMutation(result, t, response)
  assert.deepEqual(updated.proposals, result.proposals)
  assert.deepEqual(updated.entities[1].facts, { ...t.entity.facts, ...patch })
  assert.deepEqual(updated.entities[1].profile, t.entity.profile)
  assert.deepEqual(updated.entities[1].evidence.slice(0, 2), t.entity.evidence)
  assert.equal(updated.entities[1].resolutionStatus, 'NEEDS_REVIEW')
  assert.equal(updated.entities[1].evidence.filter(e => e.source === 'HUMAN').length, 3)
})
test('facts response refuses missing merge/evidence and mismatched targets', () => {
  const t = target('facts'), patch = { hasInternet: true }
  for (const mutate of [r => { r.entities[0].facts.tableCount = 0 }, r => { r.entities[0].evidenceList.pop() }, r => { r.entities[0].entityId = 'other' }, r => { r.entities[0].resolutionStatus = 'MATCHED' }, r => { r.searchExecutionId = 'other' }]) {
    const raw = makeMutationFixture({ endpoint: 'facts', body: factsRequest(t.entity, patch) }, t); mutate(raw[0]); assert.throws(() => parseFactsResponse(raw, t.entity, patch))
  }
})
test('only a verified new proposal supersedes the old; parent/entity/state/history retained', () => {
  const t = target(), before = initial(), response = parseReviewResponse(reviewFixture(t), t.proposal)
  const after = applyMutation(before, t, response)
  assert.equal(before.proposals[0].state, 'PENDING_REVIEW')
  assert.equal(after.proposals[0].state, 'SUPERSEDED')
  assert.equal(after.proposals[0].consultationScript, before.proposals[0].consultationScript)
  assert.equal(after.proposals[1].state, 'PENDING_REVIEW')
  assert.equal(after.proposals[1].parentProposalId, t.proposal.proposalId)
  assert.deepEqual(after.entities, before.entities) // F05 does not return an Entity snapshot.
  assert.throws(() => applyMutation({ ...before, searchExecutionId: 'later-search' }, t, response))
  assert.throws(() => applyMutation(after, t, response))
})
test('HTTP 200 noDraft does not rewrite state, even for APPROVED', () => {
  const t = target(); t.proposal.state = 'APPROVED'
  const response = parseReviewResponse(reviewFixture(t, 'noDraft'), t.proposal)
  assert.equal(response.kind, 'noDraft')
  const result = initial(); assert.equal(applyMutation(result, t, response), result)
})
test('incomplete/mismatched/duplicate new drafts never produce success', () => {
  const t = target()
  for (const mutate of [r => { delete r.newProposal }, r => { r.resultProposalId = 'other' }, r => { r.proposalId = 'other' }, r => { r.newProposal.entityId = 'other' }, r => { r.newProposal.parentProposalId = 'other' }, r => { r.newProposal.proposalReviewState = 'APPROVED' }, r => { r.newProposal.proposalSaved = false }, r => { delete r.newProposal.consultationScript }]) {
    const raw = reviewFixture(t); mutate(raw[0]); assert.throws(() => parseReviewResponse(raw, t.proposal))
  }
  const raw = reviewFixture(t); assert.throws(() => parseReviewResponse(raw, t.proposal, [raw[0].resultProposalId]))
})
test('LIVE and recorded mutation modes never simulate success; errors preserve their meaning', async () => {
  for (const mode of ['LIVE', 'RECORDED_FIXTURE']) await assert.rejects(createMutationService({ mode }).submit(target(), { reviewNote: '수정' }), { code: 'LIVE_NOT_CONFIGURED' })
  const service = createMutationService({ delayMs: 0 })
  for (const [scenario, code, blocked] of [['timeout', 'OUTCOME_UNKNOWN', true], ['stale', 'F05_INVALID_STATE', true], ['missing', 'F05_PROPOSAL_NOT_FOUND', true], ['invalid', 'CONTRACT_ERROR', true], ['error', 'F05_STORED_JSON_INVALID', false]]) {
    await assert.rejects(service.submit(target(), { reviewNote: '수정', scenario }), error => error.code === code && requiresRecheck(error) === blocked)
  }
  assert.equal(requiresRecheck(new TypeError('network')), true)
})
test('duplicate submit suppression makes one request without retrying transport failures', async () => {
  let calls = 0
  const service = createMutationService({ delayMs: 10, transport: () => { calls++; throw new TypeError('network loss') } })
  const first = service.submit(target(), { reviewNote: '수정' })
  await assert.rejects(service.submit(target(), { reviewNote: '수정' }), { code: 'REQUEST_IN_PROGRESS' })
  await assert.rejects(first, TypeError); assert.equal(calls, 1)
})
test('proposal reading projects optional content, preserves zero vs missing fees, excludes reentryContext', () => {
  const t = target(), raw = reviewFixture(t)[0].newProposal
  raw.selectedProducts = [{ productCode: 'DEMO', productName: '<img src=x onerror=alert(1)>', recommendationReason: '가상 이유', variants: [{ monthlyFee_0yr: null, monthlyFee_3yr: 0, internal: 'secret' }] }]
  raw.reentryContext = { internal: 'secret' }
  const view = proposalView(raw)
  assert.deepEqual(view.selectedProducts[0].variants, [{ monthlyFee_0yr: null, monthlyFee_3yr: 0 }])
  assert.equal(Object.hasOwn(view, 'reentryContext'), false)
})
