const STEPS = [
  [1, "F-01", "신규 음식점 후보"],
  [2, "F-02", "영업 가능 확인"],
  [3, "F-03", "필요 상품 분석"],
  [4, "F-04", "맞춤 상품 · 상담안"],
  [5, "F-05", "후속관리 · 저장"],
];

export default function Sidebar({ step, page, onNavigate, onHome, onStep }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <span className="sidebar-label">WORKSPACE</span>
        <button className={page === "agent" ? "sidebar-link active" : "sidebar-link"} onClick={onHome}>
          <span className="sidebar-icon">⌕</span><span>신규 영업 기회</span>
        </button>
        <button className={page === "history" ? "sidebar-link active" : "sidebar-link"} onClick={() => onNavigate("history")}>
          <span className="sidebar-icon">▦</span><span>상담 · 후속관리</span>
        </button>
      </div>

      <div className="sidebar-section flow-section">
        <span className="sidebar-label">AGENT FLOW</span>
        <div className="flow-list">
          {STEPS.map(([id, code, label]) => (
            <button
              key={id}
              type="button"
              disabled={id > step || page !== "agent"}
              className={id === step && page === "agent" ? "flow-item current" : id < step ? "flow-item done" : "flow-item"}
              onClick={() => id <= step && onStep(id)}
            >
              <span className="flow-marker">{id < step ? "✓" : id}</span>
              <span><small>{code}</small><strong>{label}</strong></span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer-card">
        <span>DATA PIPELINE</span>
        <strong>LOCALDATA → n8n → Local LLM</strong>
        <p>추론 포트 비공개 · Credential은 n8n 내부 관리</p>
      </div>
    </aside>
  );
}
