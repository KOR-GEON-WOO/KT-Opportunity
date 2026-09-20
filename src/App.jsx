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
import { dataClient, dataMode } from './services/dataClient.js';
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
  const [session, setSession] = useState(() => {
    const stored = loadAuthSession();
    if (!stored || stored.dataMode !== dataMode || stored.authenticated !== true) {
      if (stored) clearAuthSession();
      return null;
    }
    return stored;
  });
  const [authState, setAuthState] = useState({ loading: false, error: null });

  useEffect(() => {
    const handleExpired = () => {
      clearAuthSession();
      window.history.replaceState(null, '', '#home');
      setSession(null);
      setAuthState({ loading: false, error: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.' });
    };
    window.addEventListener('kt-auth-expired', handleExpired);
    return () => window.removeEventListener('kt-auth-expired', handleExpired);
  }, []);

  const login = async () => {
    setAuthState({ loading: true, error: null });
    try {
      const value = await dataClient.loginSession({ client: 'kt-opportunity' });
      const sessionValue = { ...value, dataMode };
      saveAuthSession(sessionValue);
      window.history.replaceState(null, '', '#home');
      setSession(sessionValue);
    } catch (error) {
      setAuthState({ loading: false, error: error.message || '로그인 세션을 시작하지 못했습니다.' });
      return;
    }
    setAuthState({ loading: false, error: null });
  };

  const logout = async () => {
    try {
      await dataClient.logoutSession();
    } catch {
      // 서버 로그아웃 실패와 무관하게 로컬 세션은 즉시 종료한다.
    } finally {
      clearAuthSession();
      window.history.replaceState(null, '', '#home');
      setSession(null);
    }
  };

  if (!session) return <LoginScreen onLogin={login} loading={authState.loading} error={authState.error} dataMode={dataMode} />;
  return <AgentProvider><AppWorkspace onLogout={logout} /></AgentProvider>;
}
