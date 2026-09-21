import { forwardRef } from 'react';
import Icon from '../ui/Icon.jsx';
import { dataMode } from '../../services/dataClient.js';
import { APP_VERSION } from '../../config/appMeta.js';

const items = [
  { id: 'home', label: '홈', icon: 'home' },
  { id: 'discovery', label: '신규 음식점', icon: 'search' },
  { id: 'followup', label: '후속 상담', icon: 'follow' },
  { id: 'history', label: '상담 이력', icon: 'history' },
  { id: 'products', label: '상품 기준', icon: 'products' },
];

function NavButton({ item, page, onNavigate }) {
  return (
    <button
      type="button"
      className={page === item.id ? 'active' : ''}
      onClick={() => onNavigate(item.id)}
      aria-current={page === item.id ? 'page' : undefined}
      aria-label={item.label}
      title={item.label}
    >
      <Icon name={item.icon} size={20} /><span>{item.label}</span>
    </button>
  );
}

const Sidebar = forwardRef(function Sidebar({ page, onNavigate, collapsed, onToggle, onMobileClose, mobileDrawer = false, mobileMenuOpen = false }, ref) {
  const liveMode = dataMode === 'n8n';
  const drawerClosed = mobileDrawer && !mobileMenuOpen;
  return (
    <aside
      ref={ref}
      id="app-sidebar"
      className={collapsed ? 'sidebar collapsed' : 'sidebar'}
      role={mobileDrawer ? 'dialog' : undefined}
      aria-modal={mobileDrawer && mobileMenuOpen ? 'true' : undefined}
      aria-label={mobileDrawer ? '주요 메뉴' : undefined}
      aria-hidden={drawerClosed ? 'true' : undefined}
      inert={drawerClosed ? true : undefined}
    >
      <div className="sidebar-brand-row">
        <button className="sidebar-logo" type="button" onClick={() => onNavigate('home')} aria-label="KT Opportunity 홈으로 이동" title="KT Opportunity">
          <img src="/assets/kt-wordmark-standard.png" alt="KT" />
          <span>KT Opportunity <small className="sidebar-version">{APP_VERSION}</small></span>
        </button>
        <button type="button" className="sidebar-mobile-close" onClick={onMobileClose} aria-label="메뉴 닫기" title="메뉴 닫기"><Icon name="close" size={20} /></button>
      </div>

      <nav className="sidebar-nav" aria-label="주요 메뉴">
        <span className="sidebar-section-label">영업</span>
        {items.slice(0, 3).map((item) => <NavButton key={item.id} item={item} page={page} onNavigate={onNavigate} />)}
        <span className="sidebar-section-label">데이터</span>
        {items.slice(3).map((item) => <NavButton key={item.id} item={item} page={page} onNavigate={onNavigate} />)}
      </nav>

      <div className="sidebar-status">
        <div className="sidebar-status-copy">
          <div><span className="dot" /><p><strong>LOCALDATA</strong><small>{liveMode ? 'n8n 서버 경유' : 'Mock data'}</small></p></div>
          <div><span className="dot" /><p><strong>Agent Gateway</strong><small>{liveMode ? 'n8n configured' : 'Mock mode'}</small></p></div>
        </div>
        <button type="button" className="sidebar-collapse" onClick={onToggle} aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'} title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}><Icon name="chevron" size={18} /></button>
      </div>
    </aside>
  );
});

export default Sidebar;
