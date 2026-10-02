import { useEffect, useRef, useState } from 'react'
import ThemeControl from '../../components/ThemeControl.jsx'
import FactFields from '../entities/FactFields.jsx'
import { factsPreview } from '../../domain/mutations.js'
import { MUTATION_SCENARIOS, requiresRecheck } from '../../services/mutationService.js'

export default function MutationDialog({ target, service, existingIds, onApply, onClose, onUncertain }) {
  const dialog = useRef(null), lock = useRef(false)
  const [revision, setRevision] = useState('expression')
  const [edits, setEdits] = useState({}), [note, setNote] = useState('')
  const [scenario, setScenario] = useState('success'), [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null), [blocked, setBlocked] = useState(false)
  const isFacts = target.kind === 'facts' || revision === 'facts'
  const { patch, errors } = factsPreview(target.entity.facts, edits)
  const title = target.kind === 'facts' ? '매장 사실 보완' : '제안 수정 요청'
  useEffect(() => {
    const element = dialog.current, trigger = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (trigger?.isConnected && !trigger.disabled) trigger.focus({ preventScroll: true })
      else document.getElementById('entity-title')?.focus({ preventScroll: true })
    }
  }, [])
  function close() { if (!lock.current) onClose() }
  function containTab(event) {
    if (event.target.closest('dialog') !== dialog.current || event.key !== 'Tab') return
    const controls = [...dialog.current.querySelectorAll('button, input, select, textarea, summary')].filter(element => !element.disabled && element.getClientRects().length && element.closest('dialog') === dialog.current)
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  async function submit(event) {
    event.preventDefault()
    if (lock.current || blocked) return
    if (target.kind !== 'facts' && !note.trim()) { setFeedback({ tone: 'error', message: '수정 사유를 입력해 주세요.' }); document.getElementById('review-note')?.focus(); return }
    if (isFacts && (Object.keys(errors).length || !Object.keys(patch).length)) return
    lock.current = true; setBusy(true); setFeedback(null)
    try {
      const response = await service.submit(target, { patch: isFacts ? patch : undefined, reviewNote: note, scenario, existingIds })
      if (response.kind === 'noDraft') {
        setFeedback({ tone: 'warning', message: `${response.message} (데모 응답)` }); setBlocked(true); onUncertain(target, isFacts)
      } else onApply(target, response, isFacts && target.kind !== 'facts' ? patch : undefined)
    } catch (error) {
      const uncertain = requiresRecheck(error)
      setFeedback({ tone: uncertain ? 'warning' : 'error', message: `${error.message} (${error.code ?? 'OUTCOME_UNKNOWN'})` })
      if (uncertain) { setBlocked(true); onUncertain(target, isFacts) }
    } finally { lock.current = false; setBusy(false) }
  }
  return <dialog ref={dialog} className="mutation-dialog" aria-labelledby="mutation-title" onCancel={event => { if (event.target === event.currentTarget) { event.preventDefault(); close() } }} onKeyDown={containTab}>
    <div className="section-heading"><p className="eyebrow">DEMO · 이번 세션에서만 반영</p><ThemeControl /></div>
    <h2 id="mutation-title" tabIndex={-1} autoFocus>{title}</h2>
    <p className="muted">{target.entity.profile.businessName}</p>
    <p className="small identifier">{target.proposal?.proposalId ?? target.entity.entityId}</p>
    <p className="notice info">실제 저장·AI 호출은 발생하지 않아요. 새로고침하면 데모 변경도 초기화돼요.</p>
    <form onSubmit={submit} noValidate>
      {target.kind === 'facts' ? <p className="small muted">매장 사실만 보완해요. 기존 제안은 수정되지 않아요. 상호·주소·매장 일치 판정은 변경하지 않아요.</p> : <>
        <div className="field"><label htmlFor="revision-kind">수정 방식</label><select id="revision-kind" value={revision} onChange={event => setRevision(event.target.value)} disabled={busy || blocked}><option value="expression">표현 수정</option><option value="facts" disabled={target.factSnapshotStale}>새 사실 반영</option></select></div>
        {target.factSnapshotStale && <p className="notice warning">최신 매장 조회 전에는 표현 수정만 가능해요. 이전 Fact를 다시 보내지 않아요.</p>}
        <p className="small muted revision-help">{isFacts ? '변경한 사실과 사유를 한 번의 제안 수정 요청에 포함해요.' : '사유만 보내요. 편집 중인 사실은 함께 보내지 않아요.'} 새 초안이 확인될 때까지 기존 제안을 유지해요.</p>
      </>}
      {isFacts && <FactFields original={target.entity.facts} edits={edits} onChange={setEdits} errors={errors} patch={patch} disabled={busy || blocked} />}
      {target.kind !== 'facts' && <div className="field reason-field"><label htmlFor="review-note">수정 사유 (필수)</label><textarea id="review-note" rows={4} value={note} onChange={event => setNote(event.target.value)} disabled={busy || blocked} placeholder="어떤 사실이나 표현을 바꿀지 적어 주세요." aria-invalid={feedback?.tone === 'error' && !note.trim()} aria-describedby={feedback ? 'mutation-feedback' : undefined} /></div>}
      <details className="mutation-settings"><summary>데모 검증 설정</summary><div className="field"><label htmlFor="mutation-scenario">변경 응답 시나리오</label><select id="mutation-scenario" value={scenario} onChange={event => setScenario(event.target.value)} disabled={busy || blocked}>{MUTATION_SCENARIOS.filter(([key]) => target.kind !== 'facts' || !['noDraft', 'stale'].includes(key)).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></div></details>
      <div aria-live="polite">{busy && <p className="notice info">데모 응답을 기다리고 있어요. 기존 내용과 입력을 유지합니다.</p>}</div>
      {feedback && <p id="mutation-feedback" className={`notice ${feedback.tone}`} role="alert">{feedback.message}</p>}
      {blocked && <p className="notice warning">최신 상태 조회가 연결되지 않아 이 대상의 재전송을 막았어요. 운영에서는 담당자 확인이 필요해요. 데모를 다시 시험하려면 닫은 뒤 새로 검색하세요.</p>}
      <div className="mutation-actions"><button type="button" className="secondary" onClick={close} disabled={busy}>{blocked ? '입력 확인 후 닫기' : '취소'}</button><button type="submit" className="primary" disabled={busy || blocked || (isFacts && (!Object.keys(patch).length || !!Object.keys(errors).length))}>{target.kind === 'facts' ? '데모 사실 반영' : '데모 수정 요청'}</button></div>
    </form>
  </dialog>
}
