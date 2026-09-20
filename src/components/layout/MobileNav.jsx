import Icon from '../ui/Icon.jsx';

const items = [
  ['home', '홈', 'home'],
  ['discovery', '신규', 'search'],
  ['followup', '후속', 'follow'],
  ['history', '이력', 'history'],
  ['products', '상품', 'products'],
];

export default function MobileNav({ page, onNavigate }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="모바일 주요 메뉴">
      {items.map(([id, label, icon]) => (
        <button type="button" key={id} className={page === id ? 'active' : ''} onClick={() => onNavigate(id)} aria-current={page === id ? 'page' : undefined} aria-label={label}>
          <Icon name={icon} size={20} /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
