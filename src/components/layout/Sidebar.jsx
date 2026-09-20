import Icon from '../ui/Icon.jsx';
import { dataMode } from '../../services/dataClient.js';

const items = [
  { id: 'home', label: '홈', icon: 'home' },
  { id: 'discovery', label: '신규 음식점', icon: 'search' },
  { id: 'followup', label: '후속 상담', icon: 'follow' },
  { id: 'history', label: '상담 이력', icon: 'history' },
  { id: 'products', label: '상품 기준', icon: 'products' },
];

export default function Sidebar({ page, onNavigate, collapsed, onToggle }) {
  return (
    <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'}>
      <button className="sidebar-logo" type="button" onClick={() => onNavigate('home')} aria-label="홈으로 이동">
        <img src="/assets/kt-wordmark-standard.png" alt="KT" />
        {!collapsed && <span>Opportunity Agent</span>}
      </button>

      <nav className="sidebar-nav" aria-label="주요 메뉴">
        <span className="sidebar-section-label">영업</span>
        {items.slice(0, 3).map((item) => (
          <button key={item.id} type="button" className={page === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)} aria-current={page === item.id ? 'page' : undefined}>
            <Icon name={item.icon} size={20} /><span>{item.label}</span>
          </button>
        ))}
        <span className="sidebar-section-label">데이터</span>
        {items.slice(3).map((item) => (
          <button key={item.id} type="button" className={page === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)} aria-current={page === item.id ? 'page' : undefined}>
            <Icon name={item.icon} size={20} /><span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-status">
        {!collapsed && <>
          <div><span className="dot success" /><p><strong>LOCALDATA</strong><small>PoC 연결 준비</small></p></div>
          <div><span className="dot success" /><p><strong>Agent Gateway</strong><small>{dataMode === 'mock' ? 'Mock mode' : 'n8n mode'}</small></p></div>
        </>}
        <button type="button" className="sidebar-collapse" onClick={onToggle} aria-label="사이드바 접기/펼치기"><Icon name="chevron" size={18} /></button>
      </div>
    </aside>
  );
}
