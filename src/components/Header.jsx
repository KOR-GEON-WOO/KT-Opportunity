export default function Header({ page, onNavigate }) {
  return (
    <header className="top-header">
      <button
        className="brand-lockup"
        type="button"
        onClick={() => onNavigate("dashboard")}
        aria-label="KT Sales Agent 홈"
      >
        <img
          className="brand-logo"
          src="/assets/kt-wordmark-standard.png"
          alt="KT"
        />
        <span className="brand-divider" aria-hidden="true" />
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

      <div className="header-status">
        <span className="status-pill">
          <span className="status-dot" />
          Agent Ready
        </span>
        <span className="header-user" aria-label="사용자">
          KT 직원
        </span>
      </div>
    </header>
  );
}
