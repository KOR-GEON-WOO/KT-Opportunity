import test from 'node:test'
import assert from 'node:assert/strict'
import { displayValue, kstDate, weekRange, searchRequest, validateConditions, safeUrl } from '../src/domain/search.js'
import { parseSearchResponse, ContractError } from '../src/domain/adapter.js'
import { makeFixture, SCENARIOS } from '../src/services/fixtures.js'
import { createSearchService } from '../src/services/searchService.js'
const conditions = { city: '서울특별시', district: '영등포구', startDate: '2026-10-01', endDate: '2026-10-03' }
const request = searchRequest(conditions, new Date('2026-10-02T16:00:00Z'))
test('KST date boundary, Monday through today, and exact supported request fields', () => {
  assert.equal(kstDate(new Date('2026-10-02T16:00:00Z')), '2026-10-03')
  assert.deepEqual(weekRange(new Date('2026-10-04T15:00:00Z')), { startDate: '2026-10-05', endDate: '2026-10-05' })
  assert.deepEqual(request, { schemaVersion: 'KT-OPP-V1.0', goalText: '서울특별시 영등포구 2026-10-01~2026-10-03 신규 일반음식점 찾아줘', requestedAt: '2026-10-03T01:00:00.000+09:00' })
})
test('invalid or ambiguous conditions are rejected before requesting', () => {
  for (const patch of [{ city: '' }, { district: '' }, { district: '중' }, { startDate: '2026-02-30' }, { endDate: '2026-09-01' }, { startDate: '' }]) {
    assert.ok(Object.keys(validateConditions({ ...conditions, ...patch })).length)
    assert.throws(() => searchRequest({ ...conditions, ...patch }))
  }
})
test('whole entities and draft joins survive reordering and shared addresses', () => {
  const raw = makeFixture('mixed', conditions)
  raw[0].entities.reverse()
  raw[0].entities.forEach(e => { e.storeProfile.roadAddress = '같은 주소' })
  const result = parseSearchResponse(raw, 'MOCK_FIXTURE')
  assert.deepEqual(result.summary, { total: 3, match: 1, needsReview: 2, noMatch: 0 })
  assert.equal(result.proposals.length, 1)
  assert.equal(result.proposals[0].entityId, 'ENT-DEMO-1')
  assert.equal(result.entities.find(e => e.entityId === 'ENT-DEMO-1').facts.hasInternet, false)
  assert.equal(result.entities.find(e => e.entityId === 'ENT-DEMO-1').facts.bundledProductsCount, 0)
})
test('UNKNOWN, false, zero, absent, and blank retain distinct meanings', () => {
  assert.deepEqual(['UNKNOWN', false, 0, null, undefined, ''].map(displayValue), ['미확인', '없음', '0', '정보 미제공', '정보 미제공', '빈 값'])
})
test('opaque entity IDs do not collide with JavaScript object property names', () => {
  for (const entityId of ['constructor', 'toString', '__proto__']) {
    const [raw] = makeFixture('normal', conditions)
    raw.entities[0].entityId = entityId
    raw.entities[0].evidenceList.forEach(evidence => { evidence.entityId = entityId })
    raw.downstreamResults[0].entityId = entityId
    const result = parseSearchResponse(raw, 'MOCK_FIXTURE')
    assert.equal(result.proposals[0].entityId, entityId)
    assert.equal(Object.hasOwn(result.outcomes, entityId), true)
    assert.equal(result.outcomes[entityId].saved, true)
    raw.downstreamResults.push(raw.downstreamResults[0])
    assert.throws(() => parseSearchResponse(raw, 'MOCK_FIXTURE'), ContractError)
  }
})
test('all supported scenario shapes have explicit result semantics', () => {
  for (const [scenario] of SCENARIOS.filter(([key]) => !['invalid', 'timeout'].includes(key))) {
    const result = parseSearchResponse(makeFixture(scenario, conditions), 'MOCK_FIXTURE')
    assert.equal(result.kind, ['confirmation', 'unsupported'].includes(scenario) ? 'confirmation' : scenario === 'error' ? 'error' : 'result')
    if (['unmatched', 'noCandidate', 'noOpportunity', 'modelError', 'saveError', 'empty'].includes(scenario)) assert.equal(result.proposals.length, 0)
  }
})
test('schema errors, duplicate or orphaned IDs, and false draft success are rejected', () => {
  const mutations = [
    r => { r.schemaVersion = 'bad' }, r => { delete r.entities }, r => { r.entities.push(r.entities[0]) },
    r => { r.downstreamResults[0].entityId = 'orphan' }, r => { r.downstreamResults[0].searchExecutionId = 'other' },
    r => { r.downstreamResults[0].proposalReviewState = 'PENDING' }, r => { r.downstreamResults[0].workflowStatus = 'ERROR' },
    r => { r.entities[0].facts.hasInternet = 'false' }, r => { r.entities[0].resolutionStatus = 'NEW' },
  ]
  for (const mutate of mutations) { const [raw] = makeFixture('mixed', conditions); mutate(raw); assert.throws(() => parseSearchResponse(raw, 'MOCK_FIXTURE'), ContractError) }
  assert.throws(() => parseSearchResponse([{}, {}], 'LIVE'), ContractError)
})
test('counts use entities with a diagnostic; conflict evidence is preserved', () => {
  const [raw] = makeFixture('mixed', conditions)
  raw.summary.total = 10
  const result = parseSearchResponse(raw, 'MOCK_FIXTURE')
  assert.equal(result.summary.total, 3); assert.equal(result.warnings.length, 1)
  assert.notEqual(result.entities[1].evidence[0].value.businessName, result.entities[1].evidence[1].value.name)
})
test('unsafe source protocols are excluded', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,hi', '/relative', null]) assert.equal(safeUrl(value), null)
  assert.equal(safeUrl('https://example.com/source'), 'https://example.com/source')
})
test('LIVE failure never becomes a successful fixture and recorded provenance stays explicit', async () => {
  await assert.rejects(createSearchService({ mode: 'LIVE' }).search(request), { code: 'LIVE_NOT_CONFIGURED' })
  const recorded = await createSearchService({ mode: 'RECORDED_FIXTURE', recordedResponse: makeFixture('mixed', conditions), delayMs: 0 }).search(request)
  assert.equal(recorded.dataOrigin, 'RECORDED_FIXTURE')
})
test('abort and timeout keep unknown outcomes distinct; new requests get new demo IDs', async () => {
  const service = createSearchService({ delayMs: 0 })
  const a = await service.search(request, { conditions })
  const b = await service.search(request, { conditions })
  assert.notEqual(a.searchExecutionId, b.searchExecutionId)
  await assert.rejects(service.search(request, { conditions, scenario: 'timeout' }), { code: 'OUTCOME_UNKNOWN' })
  const controller = new AbortController()
  const pending = createSearchService({ delayMs: 200 }).search(request, { conditions, signal: controller.signal })
  controller.abort(); await assert.rejects(pending, { name: 'AbortError' })
})
