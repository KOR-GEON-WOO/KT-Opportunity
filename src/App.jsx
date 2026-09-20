import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app-shell">
      <Header page={page} onNavigate={setPage} />

      <div className="workspace-shell">
        <Sidebar page={page} onNavigate={setPage} />

        <main className="app-main">
          {page === "dashboard" && <Dashboard />}
          {page === "history" && <History />}
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="모바일 주요 메뉴">
        <button
          type="button"
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          <span className="mobile-nav-icon">⌕</span>
          <span>탐색</span>
        </button>
        <button
          type="button"
          className={page === "history" ? "active" : ""}
          onClick={() => setPage("history")}
        >
          <span className="mobile-nav-icon">▦</span>
          <span>이력</span>
        </button>
      </nav>
    </div>
  );
}
