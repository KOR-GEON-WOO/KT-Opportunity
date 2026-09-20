export default function Sidebar({ page, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <section className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>
          <button
            type="button"
            className={page === "dashboard" ? "sidebar-item active" : "sidebar-item"}
            onClick={() => onNavigate("dashboard")}
          >
            <span className="sidebar-glyph">⌕</span>
            <span>영업 후보지 탐색</span>
          </button>
          <button
            type="button"
            className={page === "history" ? "sidebar-item active" : "sidebar-item"}
            onClick={() => onNavigate("history")}
          >
            <span className="sidebar-glyph">▦</span>
            <span>방문 · 상담 이력</span>
          </button>
        </section>

        <section className="sidebar-section sidebar-agent">
          <p className="sidebar-label">LOCAL AI</p>
          <div className="agent-status-card">
            <div className="agent-status-head">
              <span className="agent-orb" />
              <div>
                <strong>Gateway Ready</strong>
                <small>Local LLM Gateway</small>
              </div>
            </div>
            <dl>
              <div>
                <dt>GPU</dt>
                <dd>RTX 5070 Ti</dd>
              </div>
              <div>
                <dt>VRAM</dt>
                <dd>12 GB</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>Single Model</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </aside>
  );
}
