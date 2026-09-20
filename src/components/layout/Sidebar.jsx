import Icon from '../ui/Icon.jsx';
import { dataMode } from '../../services/dataClient.js';

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

export default function Sidebar({ page, onNavigate, collapsed, onToggle }) {
  const liveMode = dataMode === 'n8n';
  return (
    <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'}>
      <button className="sidebar-logo" type="button" onClick={() => onNavigate('home')} aria-label="영업 홈으로 이동" title="영업 홈">
        <img src="/assets/kt-wordmark-standard.png" alt="KT" />
        {!collapsed && <span>Opportunity Agent</span>}
      </button>

      <nav className="sidebar-nav" aria-label="주요 메뉴">
        <span className="sidebar-section-label">영업</span>
        {items.slice(0, 3).map((item) => <NavButton key={item.id} item={item} page={page} onNavigate={onNavigate} />)}
        <span className="sidebar-section-label">데이터</span>
        {items.slice(3).map((item) => <NavButton key={item.id} item={item} page={page} onNavigate={onNavigate} />)}
      </nav>

      <div className="sidebar-status">
        {!collapsed && <>
          <div><span className="dot" /><p><strong>LOCALDATA</strong><small>{liveMode ? 'n8n 서버 경유' : 'Mock data'}</small></p></div>
          <div><span className="dot" /><p><strong>Agent Gateway</strong><small>{liveMode ? 'n8n configured' : 'Mock mode'}</small></p></div>
        </>}
        <button type="button" className="sidebar-collapse" onClick={onToggle} aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'} title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}><Icon name="chevron" size={18} /></button>
      </div>
    </aside>
  );
}
