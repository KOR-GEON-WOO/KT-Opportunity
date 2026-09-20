export default function Header({ page, onNavigate }) {
  return (
    <header className="top-header">
      <button
        className="brand"
        type="button"
        onClick={() => onNavigate("dashboard")}
        aria-label="KT Sales Agent 홈"
      >
        <span className="brand-mark">KT</span>
        <span className="brand-copy">
          <strong>Sales Agent</strong>
          <small>영업 후보지 발굴 · 방문 준비</small>
        </span>
      </button>

      <nav className="top-nav" aria-label="주요 메뉴">
        <button
          className={page === "dashboard" ? "nav-button active" : "nav-button"}
          type="button"
          onClick={() => onNavigate("dashboard")}
        >
          영업 Agent
        </button>
        <button
          className={page === "history" ? "nav-button active" : "nav-button"}
          type="button"
          onClick={() => onNavigate("history")}
        >
          방문 · 상담 이력
        </button>
      </nav>

      <div className="system-badge" title="현재 MVP는 Mock API로 동작합니다.">
        <span className="status-dot" />
        MOCK READY
      </div>
    </header>
  );
}
