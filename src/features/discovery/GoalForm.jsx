import { goalText, weekRange, kstDate } from '../../domain/search.js'
import { SCENARIOS } from '../../services/fixtures.js'

const cities = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도', '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도']
export default function GoalForm({ values, onChange, errors, busy, onSubmit, scenario, setScenario, mode, setMode }) {
  const update = (key, value) => onChange({ ...values, [key]: value })
  const props = key => ({ id: key, name: key, value: values[key], onChange: event => update(key, event.target.value), 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `${key}-error` : undefined })
  const error = key => errors[key] && <span className="field-error" id={`${key}-error`}>{errors[key]}</span>
  return <section className="search-panel panel" aria-labelledby="search-heading">
    <div className="section-heading"><h2 id="search-heading">검색 조건</h2><span className="small muted">일반음식점 · 인허가일 기준</span></div>
    <form onSubmit={onSubmit} noValidate onKeyDown={event => { if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault() }}>
      <fieldset disabled={busy} className="search-fields"><legend className="sr-only">지역과 조회 기간</legend>
        <div className="field"><label htmlFor="city">시·도</label><select {...props('city')}><option value="">선택해 주세요</option>{cities.map(city => <option key={city}>{city}</option>)}</select>{error('city')}</div>
        <div className="field"><label htmlFor="district">시·군·구</label><input {...props('district')} autoComplete="off" placeholder="예: 영등포구" maxLength={40} />{error('district')}</div>
        <div className="field"><label htmlFor="startDate">시작일</label><input type="date" {...props('startDate')} />{error('startDate')}</div>
        <div className="field"><label htmlFor="endDate">종료일 <span className="muted">(해당일 포함)</span></label><input type="date" {...props('endDate')} />{error('endDate')}</div>
      </fieldset>
      <div className="date-actions"><span className="small muted">빠른 기간</span><button type="button" className="text-button" disabled={busy} onClick={() => onChange({ ...values, startDate: kstDate(), endDate: kstDate() })}>오늘</button><button type="button" className="text-button" disabled={busy} onClick={() => onChange({ ...values, ...weekRange() })}>이번 주</button><span className="small muted">한국 시간 · 월요일부터 오늘까지</span></div>
      <div className="goal-preview"><span className="eyebrow">전송할 검색 문장</span><p>{goalText(values)}</p></div>
      <div className="search-footer"><p className="small muted">인허가일은 실제 개업일과 다를 수 있어요.</p><button className="primary search-submit" type="submit" aria-disabled={busy}>{busy ? '응답을 기다리는 중…' : mode === 'LIVE' ? '실제 연결 확인' : '데모 매장 찾기'}<span aria-hidden="true">{busy ? '◌' : '→'}</span></button></div>
      <details className="demo-settings"><summary>데모 응답 설정</summary><p className="small muted">조건을 반영한 가상 표본으로 화면을 확인합니다. 실제 조회·저장은 하지 않아요.</p><div className="demo-controls">
        <div className="field"><label htmlFor="data-mode">데이터 모드</label><select id="data-mode" value={mode} disabled={busy} onChange={event => setMode(event.target.value)}><option value="MOCK_FIXTURE">데모 · 합성 데이터</option><option value="LIVE">LIVE · 연결 미설정</option></select></div>
        <div className="field"><label htmlFor="scenario">응답 시나리오</label><select id="scenario" value={scenario} disabled={busy || mode === 'LIVE'} onChange={event => setScenario(event.target.value)}>{SCENARIOS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      </div></details>
    </form>
  </section>
}
