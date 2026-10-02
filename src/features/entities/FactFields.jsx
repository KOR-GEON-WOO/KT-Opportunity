import { displayValue, FACT_LABELS } from '../../domain/search.js'
import { NUMBER_FACTS } from '../../domain/mutations.js'

export default function FactFields({ original, edits, onChange, errors, patch, disabled }) {
  const change = (key, value) => onChange({ ...edits, [key]: value })
  return <>
    <div className="fact-edit-grid">{Object.entries(FACT_LABELS).map(([key, label]) => {
      const number = NUMBER_FACTS.includes(key), string = key === 'internetCarrier'
      const value = Object.hasOwn(edits, key) ? edits[key] : original[key] == null ? '' : String(original[key])
      return <div className="field fact-field" key={key}>
        <label htmlFor={value === 'UNKNOWN' && (number || string) ? `mode-${key}` : `edit-${key}`}>{label}</label>
        <span className="small muted">기존: {displayValue(original[key])}</span>
        {number || string ? <>
          <select id={`mode-${key}`} aria-label={`${label} 입력 방식`} value={value === 'UNKNOWN' ? 'unknown' : 'value'} onChange={event => change(key, event.target.value === 'unknown' ? 'UNKNOWN' : '')} disabled={disabled}>
            <option value="value">{number ? '수량' : '통신사'}</option><option value="unknown">미확인</option>
          </select>
          {value !== 'UNKNOWN' && <input id={`edit-${key}`} type={number ? 'number' : 'text'} min={number ? '0' : undefined} step={number ? 'any' : undefined} value={value} onChange={event => change(key, event.target.value)} disabled={disabled} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} />}
          {value === 'UNKNOWN' && <span id={`edit-${key}`} className="small muted">값을 입력하려면 입력 방식을 바꾸세요.</span>}
        </> : <select id={`edit-${key}`} value={value} onChange={event => change(key, event.target.value)} disabled={disabled} aria-invalid={!!errors[key]}>
          <option value="" disabled>정보 미제공 · 선택해 주세요</option><option value="true">있음</option><option value="false">없음</option><option value="UNKNOWN">미확인</option>
        </select>}
        {errors[key] && <p id={`error-${key}`} className="field-error">{errors[key]}</p>}
      </div>
    })}</div>
    <section className="change-preview" aria-label="변경 전후 비교"><h3>변경 내용 <span className="small">{Object.keys(patch).length}개</span></h3>
      {Object.keys(patch).length ? <dl>{Object.entries(patch).map(([key, value]) => <div key={key}><dt>{FACT_LABELS[key]}</dt><dd>{displayValue(original[key])} → <strong>{displayValue(value)}</strong></dd></div>)}</dl> : <p className="small muted">변경한 항목만 반영해요. 비어 있는 입력은 미확인으로 처리하지 않아요.</p>}
    </section>
  </>
}
