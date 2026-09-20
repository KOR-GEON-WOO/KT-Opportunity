import { categoryLabels } from "../data/mockData";

function Column({ type, title, subtitle, items }) {
  return (
    <article className={`rule-column ${type}`}>
      <div className="rule-column-head"><span>{type === "recommend" ? "✓" : type === "exclude" ? "−" : "?"}</span><div><h3>{title}</h3><p>{subtitle}</p></div><strong>{items.length}</strong></div>
      <div className="rule-items">
        {items.length ? items.map((item) => <div key={item.category} className="rule-item"><strong>{categoryLabels[item.category]}</strong><p>{item.reason}</p><code>{item.category}</code></div>) : <div className="rule-empty">해당 상품군 없음</div>}
      </div>
    </article>
  );
}

export default function ProductRuleAnalysis({ store, analysis, verification, onBack, onGenerate, onSkip }) {
  return (
    <section className="workspace-card rule-analysis">
      <div className="panel-title wide"><div><span className="section-code">F-03 · JAVASCRIPT RULE ENGINE</span><h2>{store.storeName} 필요 상품 분석</h2><p>LLM이 아니라 명시된 계약 상태와 설치 상태 규칙으로 분류합니다.</p></div><span className="deterministic-chip">DETERMINISTIC</span></div>

      <div className="rule-context"><div><span>실제 개업</span><strong>{verification.actualOpenStatus}</strong></div><div><span>KT 인터넷 설치</span><strong>{verification.installStatus}</strong></div><div><span>판단 기준</span><strong>CONTRACT / INSTALL STATUS</strong></div></div>

      <div className="rule-columns">
        <Column type="recommend" title="추천 가능" subtitle="F-04로 전달" items={analysis.recommend} />
        <Column type="exclude" title="추천 제외" subtitle="계약 완료·불필요·설치 불가" items={analysis.exclude} />
        <Column type="confirm" title="추가 확인" subtitle="UNKNOWN 상태 유지" items={analysis.confirm} />
      </div>

      <div className="rule-explain"><span>RULE</span><p><strong>인터넷</strong>은 UNDECIDED이면서 installStatus=PASS인 경우에만 추천 후보로 전달합니다. CONTRACTED와 NOT_REQUIRED는 제외하고 UNKNOWN은 추가 확인으로 분리합니다.</p></div>
      <div className="action-row"><button className="secondary-button" onClick={onBack}>직원 확인 수정</button><div className="action-spacer" />{analysis.recommend.length === 0 && <button className="secondary-button" onClick={onSkip}>추천 없이 후속관리</button>}<button className="primary-button" disabled={analysis.recommend.length === 0} onClick={onGenerate}>AI 맞춤 상담안 생성 <span>→</span></button></div>
    </section>
  );
}
