import { useEffect, useMemo, useRef, useState } from 'react'
import ThemeControl from './components/ThemeControl.jsx'
import StatusTag from './components/StatusTag.jsx'
import GoalForm from './features/discovery/GoalForm.jsx'
import EntityDetail from './features/entities/EntityDetail.jsx'
import { searchRequest, validateConditions, weekRange } from './domain/search.js'
import { createSearchService } from './services/searchService.js'
import { createMutationService } from './services/mutationService.js'
import { applyMutation } from './domain/mutations.js'
import MutationDialog from './features/proposals/MutationDialog.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(() => ({ city: '서울특별시', district: '영등포구', ...weekRange() }))
  const [errors, setErrors] = useState({})
  const [mode, setMode] = useState('MOCK_FIXTURE')
  const [scenario, setScenario] = useState('mixed')
  const [busy, setBusy] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [result, setResult] = useState(null)
  const [applied, setApplied] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [mobileDetail, setMobileDetail] = useState(false)
  const [editor, setEditor] = useState(null)
  const [blockedIds, setBlockedIds] = useState([])
  const [staleEntities, setStaleEntities] = useState([])
  const [mutationNotice, setMutationNotice] = useState(null)
  const requestRef = useRef(null)
  const headingRef = useRef(null)
  const resultHeading = useRef(null)
  const listPosition = useRef(0)
  const service = useMemo(() => createSearchService({ mode }), [mode])
  const mutationService = useMemo(() => createMutationService({ mode }), [mode])
  useEffect(() => () => requestRef.current?.abort(), [])
  useEffect(() => {
    if (!busy) return
    const timer = setInterval(() => setElapsed(value => value + 1), 1000)
    return () => clearInterval(timer)
  }, [busy])
  const proposalMap = useMemo(() => new Map(result?.proposals.map(proposal => [proposal.entityId, proposal]) ?? []), [result])
  const visible = result?.entities.filter(entity => filter === 'all' || (filter === 'draft' ? proposalMap.has(entity.entityId) : entity.resolutionStatus === filter)) ?? []
  const selected = visible.find(entity => entity.entityId === selectedId)
  async function submit(event) {
    event.preventDefault()
    if (requestRef.current) return
    const nextErrors = validateConditions(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { document.getElementById(Object.keys(nextErrors)[0])?.focus(); return }
    const controller = new AbortController()
    requestRef.current = controller
    const conditions = { ...values }
    setBusy(true); setElapsed(0); setFeedback(null)
    try {
      const response = await service.search(searchRequest(conditions), { conditions, scenario, signal: controller.signal })
      if (requestRef.current !== controller) return
      if (response.kind !== 'result') {
        setFeedback({ tone: response.kind === 'confirmation' ? 'warning' : 'error', title: response.kind === 'confirmation' ? '검색 조건 확인이 필요해요' : '조회하지 못했어요', message: response.message })
        return
      }
      setBlockedIds([]); setStaleEntities([]); setMutationNotice(null)
      setResult(response); setApplied(conditions); setFilter('all'); setSelectedId(response.entities[0]?.entityId ?? null); setMobileDetail(false)
      requestAnimationFrame(() => resultHeading.current?.focus())
    } catch (error) {
      if (requestRef.current !== controller) return
      if (error.name !== 'AbortError') setFeedback({ tone: error.code === 'OUTCOME_UNKNOWN' ? 'warning' : 'error', title: error.code === 'OUTCOME_UNKNOWN' ? '응답 결과 미확인' : '조회하지 못했어요', message: error.message })
    } finally {
      if (requestRef.current === controller) { requestRef.current = null; setBusy(false) }
    }
  }
  function stopWaiting() {
    requestRef.current?.abort(); requestRef.current = null; setBusy(false)
    setFeedback({ tone: 'warning', title: '응답 대기를 중단했어요', message: '서버 실행 취소를 의미하지 않아요. 이 데모에서는 실제 조회·저장을 하지 않았어요.' })
  }
  function changeMode(next) { setMode(next); setResult(null); setApplied(null); setFeedback(null); setSelectedId(null); setMobileDetail(false) }
  function selectEntity(entityId) {
    listPosition.current = window.scrollY; setSelectedId(entityId); setMobileDetail(true)
    requestAnimationFrame(() => headingRef.current?.focus())
  }
  function returnToList() {
    setMobileDetail(false)
    requestAnimationFrame(() => { document.getElementById(`row-${selectedId}`)?.focus({ preventScroll: true }); window.scrollTo(0, listPosition.current) })
  }
  function openEditor(kind, entity, proposal) {
    setEditor({ kind, entity, proposal, factSnapshotStale: staleEntities.includes(entity.entityId) })
  }
  function applyChange(target, response, patch) {
    const next = applyMutation(result, target, response)
    if (patch) {
      next.proposals = next.proposals.map(proposal => proposal.proposalId === response.proposal.proposalId ? { ...proposal, submittedFacts: patch } : proposal)
      setStaleEntities(ids => [...new Set([...ids, target.entity.entityId])])
    }
    setResult(next); setEditor(null)
    setMutationNotice({ entityId: target.entity.entityId, text: response.kind === 'facts' ? '데모 사실을 반영하고 직원 확인 근거를 추가했어요. 기존 제안은 자동으로 수정되지 않아요.' : '새 데모 초안을 검토 대기로 연결했어요. 이전 버전도 선택해서 읽을 수 있어요.' })
  }
  function markUncertain(target, isFacts) {
    setBlockedIds(ids => [...new Set([...ids, target.proposal?.proposalId ?? target.entity.entityId])])
    if (isFacts) setStaleEntities(ids => [...new Set([...ids, target.entity.entityId])])
  }
  return <div className={`app${mobileDetail ? ' detail-open' : ''}`}>
    <a href="#main" className="skip-link">본문 바로가기</a>
    <header className="app-header"><div className="header-inner"><a className="brand" href="#main" aria-label="KT Opportunity 본문"><span className="wordmark"><img className="logo-light" src="/brand/kt-light.png" alt="KT" /><img className="logo-dark" src="/brand/kt-dark.png" alt="KT" /></span><span>Opportunity</span></a><div className="header-tools"><span className={`tag ${mode === 'LIVE' ? 'warning' : 'info'}`}>{mode === 'LIVE' ? 'LIVE · 미연결' : 'DEMO'}</span><ThemeControl /></div></div></header>
    <main id="main" className="main-content">
      <div className="page-heading"><div><p className="eyebrow">KT ENTERPRISE · 영업 기회 발굴</p><h1>새로운 매장, 다음 기회의 시작</h1><p className="muted">매장을 찾고, 근거를 확인하며 다음 대화를 준비하세요.</p></div><div className="session-note"><span className="status-dot" aria-hidden="true" />이번 작업의 결과<span>새로고침하면 검색 결과가 초기화돼요.</span></div></div>
      <div className={`mode-banner ${mode === 'LIVE' ? 'warning' : 'info'}`}><span className="banner-symbol" aria-hidden="true">{mode === 'LIVE' ? '!' : 'i'}</span><div><strong>{mode === 'LIVE' ? '실제 데이터 연결이 준비되지 않았어요' : '데모 워크스페이스'}</strong><span>{mode === 'LIVE' ? '연결 확인 시 미설정 오류를 표시해요. 데모 응답으로 대체하지 않아요.' : '검색 결과와 초안은 합성 데이터입니다. 실제 매장 조회나 저장은 발생하지 않아요.'}</span></div></div>
      <GoalForm values={values} onChange={setValues} errors={errors} busy={busy} onSubmit={submit} scenario={scenario} setScenario={setScenario} mode={mode} setMode={changeMode} />
      <div className="request-state" aria-live="polite" aria-atomic="true">{busy && <p>데모 응답을 기다리고 있어요. 검색 조건을 유지하고 있어요.</p>}{!busy && !feedback && result && <span className="sr-only">검색 완료. 전체 매장 {result.summary.total}개, 확인 필요 {result.summary.needsReview}개, 초안 {proposalMap.size}개.</span>}</div>
      {busy && <div className="waiting notice info"><span>응답 대기 · {elapsed}초</span><button className="secondary" onClick={stopWaiting}>응답 대기 중단</button></div>}
      {feedback && <section className={`notice ${feedback.tone}`} role="alert"><strong>{feedback.title}</strong><p>{feedback.message}</p>{result && <p className="small">아래 목록은 이전에 완료한 검색 결과입니다.</p>}<button className="text-button" onClick={() => document.getElementById('district')?.focus()}>검색 조건 확인하기 ↑</button></section>}
      {result ? <section className="results" aria-labelledby="result-heading" aria-busy={busy}>
        <div className="result-heading"><div><p className="eyebrow">{busy || feedback ? '이전 완료 결과' : '이번 검색 결과'} · 합성 데이터</p><h2 id="result-heading" tabIndex={-1} ref={resultHeading}>전체 매장 <span>{result.summary.total}</span></h2><p className="small muted">{applied.city} {applied.district} · {applied.startDate} ~ {applied.endDate} · 일반음식점</p></div><div className="result-counts"><span>매장 일치 <strong>{result.summary.match}</strong></span><span>확인 필요 <strong>{result.summary.needsReview}</strong></span><span>초안 <strong>{proposalMap.size}</strong></span></div></div>
        {result.workflowStatus === 'NEEDS_REVIEW' && <p className="result-notice warning">확인할 정보가 있어요. 유효한 매장 결과와 생성된 초안을 함께 표시합니다.</p>}
        {result.warnings.map(warning => <p className="notice warning" key={warning}>{warning}</p>)}
        {result.entities.length === 0 ? <div className="empty-state panel"><span className="empty-icon" aria-hidden="true">⌕</span><h3>조건에 맞는 매장이 없어요</h3><p className="muted">정상적으로 완료한 0건 데모 응답이에요. 지역이나 기간을 바꿔 다시 찾아보세요.</p><button className="secondary" onClick={() => document.getElementById('district')?.focus()}>검색 조건 바꾸기</button></div> : <div className="workspace">
          <section className="list-panel panel" aria-label="매장 목록"><div className="list-controls"><label htmlFor="result-filter">매장 필터</label><select id="result-filter" value={filter} onChange={event => { setFilter(event.target.value); setSelectedId(null); setMobileDetail(false) }}><option value="all">전체 매장 ({result.summary.total})</option><option value="MATCH">매장 일치 ({result.summary.match})</option><option value="NEEDS_REVIEW">확인 필요 ({result.summary.needsReview})</option><option value="NO_MATCH">미일치 ({result.summary.noMatch})</option><option value="draft">초안 있음 ({proposalMap.size})</option></select></div><p className="list-caption small muted">{visible.length}개 표시 · 응답 순서</p><ul className="entity-list">{visible.map(entity => <li key={entity.entityId}><button id={`row-${entity.entityId}`} className={`entity-row${selectedId === entity.entityId ? ' selected' : ''}`} aria-pressed={selectedId === entity.entityId} onClick={() => selectEntity(entity.entityId)}><div className="row-tags"><StatusTag status={entity.resolutionStatus} /><span className="small muted">{proposalMap.has(entity.entityId) ? '초안 있음' : '초안 없음'}</span></div><strong>{entity.profile.businessName ?? '상호 미제공'}</strong><span className="row-address">{entity.profile.roadAddress ?? '주소 미제공'}</span><span className="row-bottom small muted">인허가 {entity.profile.permitDate ?? '미확인'}<span aria-hidden="true">↗</span></span></button></li>)}</ul>{!visible.length && <p className="filter-empty muted">이 필터에 해당하는 매장이 없어요. 다른 필터를 선택해 주세요.</p>}</section>
          {selected ? <EntityDetail key={selected.entityId} entity={selected} proposals={result.proposals.filter(proposal => proposal.entityId === selected.entityId)} outcome={result.outcomes[selected.entityId]} onBack={returnToList} headingRef={headingRef} onEdit={(kind, proposal) => openEditor(kind, selected, proposal)} blockedIds={blockedIds} staleFacts={staleEntities.includes(selected.entityId)} busy={busy} notice={mutationNotice?.entityId === selected.entityId ? mutationNotice.text : null} /> : <div className="detail-panel panel empty-state"><span className="empty-icon" aria-hidden="true">↖</span><h3>확인할 매장을 선택하세요</h3><p className="muted">매장 정보와 출처별 근거를 함께 볼 수 있어요.</p></div>}
        </div>}
      </section> : !busy && !feedback && <section className="initial-state" aria-label="시작 안내"><span className="empty-icon" aria-hidden="true">⌕</span><h2>지역을 정하고, 기회를 찾아보세요</h2><p className="muted">검색하면 전체 매장과 확인이 필요한 정보를 한곳에서 볼 수 있어요.</p><div className="journey"><span><b>01</b> 조건 입력</span><i aria-hidden="true">→</i><span><b>02</b> 전체 매장 확인</span><i aria-hidden="true">→</i><span><b>03</b> 근거 살펴보기</span></div></section>}
      <footer className="app-footer"><span>KT Opportunity</span><span>판단의 근거를 확인하고, 최종 결정은 사람이 합니다.</span></footer>
    </main>
    {editor && <MutationDialog target={editor} service={mutationService} existingIds={result.proposals.map(proposal => proposal.proposalId)} onApply={applyChange} onClose={() => setEditor(null)} onUncertain={markUncertain} />}
  </div>
}
export default App
