import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LoginScreen from "./components/LoginScreen";
import AgentWorkspace from "./pages/AgentWorkspace";
import History from "./pages/History";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "./utils/storage";

function pageFromHash() {
  return window.location.hash === "#history" ? "history" : "agent";
}

export default function App() {
  const [session, setSession] = useState(() => loadAuthSession());
  const [page, setPage] = useState(pageFromHash);
  const [currentStep, setCurrentStep] = useState(1);
  const agentRef = useRef({ step: 1, setStep: () => {} });

  useEffect(() => {
    const handleHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", handleHash);
    if (!window.location.hash) window.history.replaceState(null, "", "#agent");
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const login = () => {
    const next = { role: "KT_SALES_POC", loggedInAt: new Date().toISOString() };
    saveAuthSession(next);
    setSession(next);
  };

  const logout = () => {
    clearAuthSession();
    setSession(null);
  };

  const navigate = (next) => {
    setPage(next);
    window.location.hash = next === "history" ? "history" : "agent";
  };

  if (!session) return <LoginScreen onLogin={login} />;

  return (
    <div className="app-shell">
      <Header page={page} onNavigate={navigate} onLogout={logout} />
      <div className="workspace-shell">
        <Sidebar
          page={page}
          step={currentStep}
          onNavigate={navigate}
          onStep={(step) => { navigate("agent"); agentRef.current?.setStep?.(step); }}
        />
        <main className="app-main">
          {page === "agent" ? <AgentWorkspace agentRef={agentRef} onStepChange={setCurrentStep} /> : <History />}
        </main>
      </div>
      <nav className="mobile-nav">
        <button className={page === "agent" ? "active" : ""} onClick={() => navigate("agent")}><span>⌕</span>영업 Agent</button>
        <button className={page === "history" ? "active" : ""} onClick={() => navigate("history")}><span>▦</span>후속관리</button>
      </nav>
    </div>
  );
}
