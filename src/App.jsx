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

  const scrollToTop = (behavior = "smooth") => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior });
    });
  };

  const login = () => {
    const next = { role: "KT_SALES_POC", loggedInAt: new Date().toISOString() };
    saveAuthSession(next);
    window.history.replaceState(null, "", "#agent");
    setPage("agent");
    setCurrentStep(1);
    setSession(next);
    scrollToTop("auto");
  };

  const logout = () => {
    clearAuthSession();
    window.history.replaceState(null, "", "#agent");
    setPage("agent");
    setCurrentStep(1);
    setSession(null);
    scrollToTop("auto");
  };

  const navigate = (next) => {
    setPage(next);
    window.location.hash = next === "history" ? "history" : "agent";
    scrollToTop();
  };

  const goToStep = (step) => {
    if (window.location.hash !== "#agent") {
      window.location.hash = "agent";
    }
    setPage("agent");
    agentRef.current?.setStep?.(step);
    setCurrentStep(step);
    scrollToTop();
  };

  const goHome = () => goToStep(1);

  if (!session) return <LoginScreen onLogin={login} />;

  return (
    <div className="app-shell">
      <Header page={page} onNavigate={navigate} onHome={goHome} onLogout={logout} />
      <div className="workspace-shell">
        <Sidebar
          page={page}
          step={currentStep}
          onNavigate={navigate}
          onHome={goHome}
          onStep={goToStep}
        />
        <main className="app-main" id="main-content">
          {page === "agent" ? <AgentWorkspace agentRef={agentRef} onStepChange={setCurrentStep} /> : <History />}
        </main>
      </div>
      <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
        <button className={page === "agent" ? "active" : ""} onClick={() => navigate("agent")}><span>⌕</span>영업 Agent</button>
        <button className={page === "history" ? "active" : ""} onClick={() => navigate("history")}><span>▦</span>후속관리</button>
      </nav>
    </div>
  );
}
