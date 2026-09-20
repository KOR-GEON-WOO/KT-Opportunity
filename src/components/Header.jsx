import { dataMode } from "../services/dataClient";

export default function Header({ page, onNavigate, onHome, onLogout }) {
  return (
    <header className="top-header">
      <button
        className="brand-lockup"
        type="button"
        onClick={onHome}
        aria-label="KT Opportunity 메인 배너로 이동"
        title="메인으로"
      >
        <img src="/assets/kt-wordmark-standard.png" alt="KT" />
        <span className="brand-divider" />
        <span className="brand-text">
          <strong>Opportunity</strong>
          <small>신규 음식점 영업 기회 발굴 · 맞춤 상품 설계</small>
        </span>
      </button>

      <nav className="top-nav" aria-label="주요 메뉴">
        <button className={page === "agent" ? "active" : ""} onClick={() => onNavigate("agent")}>영업 Agent</button>
        <button className={page === "history" ? "active" : ""} onClick={() => onNavigate("history")}>상담 · 후속관리</button>
      </nav>

      <div className="header-actions">
        <span className={`mode-pill ${dataMode}`}>
          <i /> {dataMode === "n8n" ? "N8N LIVE" : "POC MOCK"}
        </span>
        <div className="user-chip">
          <span className="user-avatar">KT</span>
          <div><strong>영업 직원</strong><small>Demo Session</small></div>
        </div>
        <button className="logout-button" type="button" onClick={onLogout}>로그아웃</button>
      </div>
    </header>
  );
}
