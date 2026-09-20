import { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

function pageFromHash() {
  return window.location.hash === "#history" ? "history" : "dashboard";
}

export default function App() {
  const [page, setPageState] = useState(pageFromHash);

  useEffect(() => {
    const handleHashChange = () => setPageState(pageFromHash());
    window.addEventListener("hashchange", handleHashChange);

    if (!window.location.hash) {
      window.history.replaceState(null, "", "#agent");
    }

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const setPage = (nextPage) => {
    const hash = nextPage === "history" ? "#history" : "#agent";

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setPageState(nextPage);
    }
  };

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
          aria-current={page === "dashboard" ? "page" : undefined}
          onClick={() => setPage("dashboard")}
        >
          <span className="mobile-nav-icon">⌕</span>
          <span>탐색</span>
        </button>
        <button
          type="button"
          className={page === "history" ? "active" : ""}
          aria-current={page === "history" ? "page" : undefined}
          onClick={() => setPage("history")}
        >
          <span className="mobile-nav-icon">▦</span>
          <span>이력</span>
        </button>
      </nav>
    </div>
  );
}
