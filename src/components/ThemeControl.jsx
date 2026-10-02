import { useId, useRef, useSyncExternalStore } from 'react'

const subscribe = callback => {
  window.addEventListener('kt-theme-change', callback)
  return () => window.removeEventListener('kt-theme-change', callback)
}
const snapshot = () => `${window.ktTheme?.get() ?? 'system'}:${document.documentElement.dataset.theme ?? 'light'}`
const labels = { light: '라이트', dark: '다크', system: '시스템' }

export default function ThemeControl() {
  const [preference, applied] = useSyncExternalStore(subscribe, snapshot).split(':')
  const dialog = useRef(null)
  const titleId = useId()
  function containTab(event) {
    if (event.key !== 'Tab') return
    const controls = [...dialog.current.querySelectorAll('button, input:checked')]
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  return <>
    <button className="theme-trigger secondary" onClick={() => dialog.current.showModal()} aria-haspopup="dialog">
      <span aria-hidden="true">◐</span> 화면 테마 <span className="theme-value">· {labels[preference]}</span>
    </button>
    <dialog ref={dialog} aria-labelledby={titleId} className="theme-dialog" onKeyDown={containTab}>
      <div className="section-heading"><h2 id={titleId}>화면 테마</h2><button className="icon-button" onClick={() => dialog.current.close()} aria-label="테마 설정 닫기">×</button></div>
      <p className="muted">편안하게 읽을 수 있는 화면을 선택하세요.</p>
      <fieldset className="theme-options"><legend className="sr-only">테마 선택</legend>
        {Object.entries(labels).map(([value, label]) => <label key={value}>
          <input type="radio" name={`theme-${titleId}`} value={value} checked={preference === value} onChange={() => window.ktTheme?.set(value)} />
          <span>{label}</span><span className="muted">{value === 'system' ? '기기 설정에 맞춤' : value === 'light' ? '밝은 화면' : '어두운 화면'}</span>
        </label>)}
      </fieldset>
      <p className="small muted" aria-live="polite">현재 {labels[applied]} 테마가 적용되어 있어요.</p>
      <button className="primary full" onClick={() => dialog.current.close()}>적용 완료</button>
    </dialog>
  </>
}
