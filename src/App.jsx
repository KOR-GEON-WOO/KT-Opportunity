import { useEffect, useState } from 'react';
import { AgentProvider, useAgent } from './app/AgentProvider.jsx';
import LoginScreen from './components/layout/LoginScreen.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import MobileNav from './components/layout/MobileNav.jsx';
import LoadingOverlay from './components/ui/LoadingOverlay.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Discovery from './features/discovery/Discovery.jsx';
import Proposal from './features/proposal/Proposal.jsx';
import FollowUp from './features/followup/FollowUp.jsx';
import History from './features/history/History.jsx';
import ProductStandards from './features/products/ProductStandards.jsx';
import { clearAuthSession, loadAuthSession, saveAuthSession } from './utils/storage.js';

const VALID_PAGES = new Set(['home', 'discovery', 'proposal', 'followup', 'history', 'products']);

function pageFromHash() {
  const page = window.location.hash.replace('#', '');
  return VALID_PAGES.has(page) ? page : 'home';
}

function AppWorkspace({ onLogout }) {
  const [page, setPage] = useState(pageFromHash);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { loading } = useAgent();

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.history.replaceState(null, '', '#home');
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (next) => {
    const safe = VALID_PAGES.has(next) ? next : 'home';
    setPage(safe);
    setMobileMenuOpen(false);
    if (window.location.hash !== `#${safe}`) window.location.hash = safe;
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  let content = <Dashboard onNavigate={navigate} />;
  if (page === 'discovery') content = <Discovery onNavigate={navigate} />;
  if (page === 'proposal') content = <Proposal onNavigate={navigate} />;
  if (page === 'followup') content = <FollowUp onNavigate={navigate} />;
  if (page === 'history') content = <History />;
  if (page === 'products') content = <ProductStandards />;

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <Sidebar page={page} onNavigate={navigate} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      {mobileMenuOpen && <button type="button" className="mobile-backdrop" aria-label="메뉴 닫기" onClick={() => setMobileMenuOpen(false)} />}
      <div className="app-column">
        <Topbar page={page} onLogout={onLogout} onMenu={() => setMobileMenuOpen((v) => !v)} />
        <main className="app-main" id="main-content">{content}</main>
      </div>
      <MobileNav page={page} onNavigate={navigate} />
      <LoadingOverlay value={loading} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => loadAuthSession());

  const login = () => {
    const value = { role: 'KT_SALES_POC', loggedInAt: new Date().toISOString() };
    saveAuthSession(value);
    window.history.replaceState(null, '', '#home');
    setSession(value);
  };

  const logout = () => {
    clearAuthSession();
    window.history.replaceState(null, '', '#home');
    setSession(null);
  };

  if (!session) return <LoginScreen onLogin={login} />;
  return <AgentProvider><AppWorkspace onLogout={logout} /></AgentProvider>;
}
