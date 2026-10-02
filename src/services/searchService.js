import { parseSearchResponse } from '../domain/adapter.js'
import { makeFixture } from './fixtures.js'
let sequence = 0
export class SearchServiceError extends Error {
  constructor(code, message) { super(message); this.name = 'SearchServiceError'; this.code = code }
}
export function createSearchService({ mode = 'MOCK_FIXTURE', recordedResponse, delayMs = 650 } = {}) {
  return {
    async search(request, { conditions, scenario = 'mixed', signal } = {}) {
      if (mode === 'LIVE') throw new SearchServiceError('LIVE_NOT_CONFIGURED', '실제 연결이 준비되지 않았어요. 데모 결과로 대체하지 않았어요.')
      if (!['MOCK_FIXTURE', 'RECORDED_FIXTURE'].includes(mode)) throw new SearchServiceError('INVALID_MODE', '지원하지 않는 데이터 모드예요.')
      if (!request?.goalText) throw new SearchServiceError('INVALID_REQUEST', '검색 조건이 필요해요.')
      const currentSequence = ++sequence
      await new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(new DOMException('응답 대기 중단', 'AbortError'))
        const onAbort = () => { clearTimeout(timer); reject(new DOMException('응답 대기 중단', 'AbortError')) }
        const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve() }, delayMs)
        signal?.addEventListener('abort', onAbort, { once: true })
      })
      if (scenario === 'timeout' && mode === 'MOCK_FIXTURE') throw new SearchServiceError('OUTCOME_UNKNOWN', '응답을 확인하지 못했어요. 실제 연결에서는 서버 처리가 계속됐을 수 있어요. 데모에서는 저장되지 않아요.')
      return parseSearchResponse(mode === 'RECORDED_FIXTURE' ? recordedResponse : makeFixture(scenario, conditions, currentSequence), mode)
    },
  }
}
