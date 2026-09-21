import { useEffect, useRef, useState } from 'react';
import { AgentProvider, useAgent } from './app/AgentProvider.jsx';
import LoginScreen from './components/layout/LoginScreen.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import WorkflowTrail from './components/layout/WorkflowTrail.jsx';
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
  const [mobileLayout, setMobileLayout] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const mainRef = useRef(null);
  const { loading } = useAgent();

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.history.replaceState(null, '', '#home');
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)');
    const sync = () => {
      setMobileLayout(media.matches);
      if (!media.matches) setMobileMenuOpen(false);
    };
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  const closeMobileMenu = (restoreFocus = true) => {
    setMobileMenuOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    if (!mobileLayout || !mobileMenuOpen) return undefined;

    const drawer = sidebarRef.current;
    const focusableSelector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const getFocusable = () => Array.from(drawer?.querySelectorAll(focusableSelector) || [])
      .filter((element) => !element.hasAttribute('inert') && element.getClientRects().length > 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(() => {
      const preferred = drawer?.querySelector('.sidebar-mobile-close, .sidebar-nav button.active');
      preferred?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileLayout, mobileMenuOpen]);

  const navigate = (next) => {
    const safe = VALID_PAGES.has(next) ? next : 'home';
    setPage(safe);
    setMobileMenuOpen(false);
    if (window.location.hash !== `#${safe}`) window.location.hash = safe;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      mainRef.current?.focus({ preventScroll: true });
    });
  };

  let content = <Dashboard onNavigate={navigate} />;
  if (page === 'discovery') content = <Discovery onNavigate={navigate} />;
  if (page === 'proposal') content = <Proposal onNavigate={navigate} />;
  if (page === 'followup') content = <FollowUp onNavigate={navigate} />;
  if (page === 'history') content = <History />;
  if (page === 'products') content = <ProductStandards />;

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <a className="skip-link" href="#main-content">본문 바로가기</a>
      <Sidebar
        ref={sidebarRef}
        page={page}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        onMobileClose={() => closeMobileMenu(true)}
        mobileDrawer={mobileLayout}
        mobileMenuOpen={mobileMenuOpen}
      />
      {mobileMenuOpen && <button type="button" className="mobile-backdrop" aria-label="메뉴 닫기" onClick={() => closeMobileMenu(true)} />}
      <div className="app-column">
        <Topbar
          ref={menuButtonRef}
          page={page}
          onLogout={onLogout}
          onMenu={() => (mobileMenuOpen ? closeMobileMenu(false) : setMobileMenuOpen(true))}
          menuOpen={mobileMenuOpen}
        />
        <WorkflowTrail page={page} onNavigate={navigate} />
        <main ref={mainRef} className="app-main" id="main-content" tabIndex="-1" aria-busy={Boolean(loading)}>{content}</main>
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
