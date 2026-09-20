import { useState } from "react";

export default function Header({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (nextPage) => {
    onNavigate(nextPage);
    setMenuOpen(false);
  };

  return (
    <header className="top-header">
      <button
        className="brand-lockup"
        type="button"
        onClick={() => navigate("dashboard")}
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
          onClick={() => navigate("dashboard")}
        >
          영업 Agent
        </button>
        <button
          className={page === "history" ? "nav-button active" : "nav-button"}
          type="button"
          onClick={() => navigate("history")}
        >
          방문 · 상담 이력
        </button>
      </nav>

      <div className="header-status">
        <span className="status-pill demo">
          <span className="status-dot" />
          DEMO MODE
        </span>
        <button
          className="tablet-menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="태블릿 메뉴 열기"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="tablet-drawer">
          <div className="tablet-drawer-head">
            <strong>KT Sales Agent</strong>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">
              ×
            </button>
          </div>

          <button
            type="button"
            className={page === "dashboard" ? "drawer-item active" : "drawer-item"}
            onClick={() => navigate("dashboard")}
          >
            영업 후보지 탐색
          </button>

          <button
            type="button"
            className={page === "history" ? "drawer-item active" : "drawer-item"}
            onClick={() => navigate("history")}
          >
            방문 · 상담 이력
          </button>

          <div className="drawer-status">
            <span>Local AI</span>
            <strong>Mock API</strong>
            <small>실제 Gateway 상태가 아닙니다.</small>
          </div>
        </div>
      )}
    </header>
  );
}
