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
          <p className="sidebar-label">DEMO ENVIRONMENT</p>
          <div className="agent-status-card demo">
            <div className="agent-status-head">
              <span className="agent-orb" />
              <div>
                <strong>Mock API</strong>
                <small>Local LLM 연동 전 UI 시연 모드</small>
              </div>
            </div>
            <dl>
              <div>
                <dt>GPU Target</dt>
                <dd>RTX 5070 Ti</dd>
              </div>
              <div>
                <dt>VRAM Target</dt>
                <dd>12 GB</dd>
              </div>
              <div>
                <dt>Gateway</dt>
                <dd>Not Connected</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </aside>
  );
}
