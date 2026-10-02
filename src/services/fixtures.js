import { SCHEMA } from '../domain/search.js'
export const SCENARIOS = [
  ['mixed', '혼합 결과 · 3개 매장 / 초안 1개'], ['normal', '정상 · 매장 일치 1개'],
  ['empty', '정상 · 검색 결과 0건'], ['unmatched', '확인 필요 · 일치 매장 없음'],
  ['confirmation', '검색 조건 확인 요청'], ['unsupported', '미지원 조건 안내'],
  ['noCandidate', '상품 후보 없음'], ['noOpportunity', '연결 상품 없음'],
  ['modelError', '초안 생성 오류'], ['saveError', '초안 저장 실패'],
  ['error', '조회 오류'], ['invalid', '응답 형식 오류'], ['timeout', '응답 결과 미확인'],
]
export function makeFixture(scenario, conditions, sequence = 1) {
  const searchExecutionId = `SEARCH-DEMO-${sequence}`
  const collectedAt = '2026-10-03T09:00:00+09:00'
  const names = ['온기 식탁 (가상)', '모퉁이 부엌 (가상)', '소담한 상차림과 따뜻한 하루를 만드는 식당 (가상)']
  const entities = names.map((name, index) => {
    const entityId = `ENT-DEMO-${index + 1}`
    const roadAddress = `${conditions.city} ${conditions.district.trim()} 예시로 24, ${index === 2 ? '2층 201호' : '1층'} (가상 주소)`
    const storeProfile = { businessName: name, industry: 'RESTAURANT', businessStatus: 'OPEN', permitDate: conditions.startDate, roadAddress, phone: null }
    return { entityId, searchExecutionId, resolutionStatus: index === 0 ? 'MATCH' : 'NEEDS_REVIEW', storeProfile,
      facts: { tableCount: index === 0 ? 12 : 'UNKNOWN', hasInternet: index === 0 ? false : 'UNKNOWN', hasLandline: 'UNKNOWN', cctvRequired: 'UNKNOWN', needInternet: 'UNKNOWN', internetCarrier: 'UNKNOWN', hasPos: 'UNKNOWN', backupLineNeeded: 'UNKNOWN', bundledProductsCount: index === 0 ? 0 : 'UNKNOWN' },
      evidenceList: [
        { evidenceId: `EVI-DEMO-${index}-1`, entityId, field: 'storeProfile', normalizedValue: storeProfile, sourceName: 'MOIS_RESTAURANT', sourceRecordId: `DEMO-PERMIT-${index}`, status: 'CONFIRMED', collectedAt },
        { evidenceId: `EVI-DEMO-${index}-2`, entityId, field: 'resolution', normalizedValue: { top: { name: index === 1 ? '모퉁이 분식 (가상)' : name, address: roadAddress, phone: null } }, sourceName: 'KAKAO', sourceRecordId: `DEMO-PLACE-${index}`, status: index ? 'NEEDS_REVIEW' : 'CONFIRMED', collectedAt },
      ],
    }
  })
  const base = { schemaVersion: SCHEMA, searchExecutionId }
  if (['confirmation', 'unsupported'].includes(scenario)) return [{ ...base, goalParseStatus: scenario === 'confirmation' ? 'NEEDS_CONFIRMATION' : 'UNSUPPORTED', apiExecutionAllowed: false, reason: scenario === 'confirmation' ? '지역을 한 번 더 확인해 주세요. 시·도와 시·군·구를 함께 입력해 주세요.' : '일반음식점만 지원하는 데모예요. 조회 조건을 확인해 주세요.' }]
  if (scenario === 'error') return [{ ...base, workflowStatus: 'ERROR', errorCode: 'DEMO_UPSTREAM_ERROR', reason: '매장 정보를 조회하지 못했어요. 입력 조건은 유지했어요. 다시 검색해 주세요.' }]
  if (scenario === 'invalid') return [{ ...base, workflowStatus: 'COMPLETED', items: [] }]
  let included = scenario === 'empty' ? [] : ['normal', 'noCandidate', 'noOpportunity', 'modelError', 'saveError'].includes(scenario) ? [entities[0]] : entities
  if (scenario === 'unmatched') included = entities.slice(1).map((entity, index) => ({ ...entity, resolutionStatus: index ? 'NO_MATCH' : 'NEEDS_REVIEW' }))
  const noDraft = { noCandidate: 'NO_CANDIDATE', noOpportunity: 'NO_OPPORTUNITY', modelError: 'ERROR', saveError: 'ERROR' }[scenario]
  const reason = {
    noCandidate: '상품 규칙을 통과한 후보가 없어 초안을 만들지 않았어요.',
    noOpportunity: '매장 필요와 연결되는 상품이 없어 초안을 만들지 않았어요.',
    modelError: '초안 생성 결과의 형식을 확인하지 못했어요. 검토할 초안을 제공하지 않았어요.',
    saveError: '초안 저장을 완료하지 못했어요. 저장된 초안으로 표시하지 않았어요.',
  }[scenario]
  const downstreamResults = included.some(e => e.resolutionStatus === 'MATCH') ? [{
    ...base, entityId: entities[0].entityId, workflowStatus: noDraft || 'COMPLETED', proposalId: noDraft ? null : `PROP-DEMO-${sequence}`, proposalSaved: !noDraft, ...(reason ? { reason } : {}),
    ...(noDraft ? { errorCode: scenario === 'saveError' ? 'DEMO_STORAGE_ERROR' : scenario === 'modelError' ? 'DEMO_MODEL_ERROR' : null } : { proposalReviewState: 'PENDING_REVIEW', analysis: { opportunity: '인터넷 사용 현황과 매장 운영 계획을 먼저 확인해 볼 수 있어요.' }, consultationScript: '매장 운영을 준비하시면서 인터넷이나 POS 연결이 필요한 상황이 있으신가요? 현재 사용 환경을 확인한 뒤 적합한 상품을 함께 검토하겠습니다.', warnings: ['가상 초안입니다. 실제 상품 가입 조건과 고객 수요는 확인되지 않았습니다.'] }),
  }] : []
  return [{ ...base, workflowStatus: included.some(e => e.resolutionStatus !== 'MATCH') || ['modelError', 'saveError'].includes(scenario) ? 'NEEDS_REVIEW' : 'COMPLETED', entities: included, items: included.filter(e => e.resolutionStatus === 'MATCH'), downstreamResults, completedThrough: downstreamResults.length ? 'F04' : 'F02', summary: { total: included.length, match: included.filter(e => e.resolutionStatus === 'MATCH').length, needsReview: included.filter(e => e.resolutionStatus === 'NEEDS_REVIEW').length, noMatch: included.filter(e => e.resolutionStatus === 'NO_MATCH').length } }]
}
