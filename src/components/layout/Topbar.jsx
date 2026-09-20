import { forwardRef } from 'react';
import Icon from '../ui/Icon.jsx';

const titles = {
  home: ['영업 홈', '오늘의 신규 영업 기회와 후속 업무를 확인합니다.'],
  discovery: ['신규 음식점', '최근 인허가 음식점을 찾고 영업 가능성을 확인합니다.'],
  proposal: ['맞춤 제안', '확인된 매장 상태와 검수 상품 기준으로 상담안을 준비합니다.'],
  followup: ['후속 상담', '상담 결과와 다음 액션을 기록합니다.'],
  history: ['상담 이력', '매장별 상담 기록과 후속 일정을 확인합니다.'],
  products: ['상품 기준', 'Agent가 사용할 수 있는 검수 완료 상품 기준을 확인합니다.'],
};

const Topbar = forwardRef(function Topbar({ page, onLogout, onMenu, menuOpen = false }, ref) {
  const [title, description] = titles[page] || titles.home;
  return (
    <header className="topbar">
      <button ref={ref} type="button" className="mobile-menu-button" onClick={onMenu} aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={menuOpen} aria-controls="app-sidebar"><Icon name={menuOpen ? 'close' : 'menu'} /></button>
      <div className="topbar-title"><h1>{title}</h1><p>{description}</p></div>
      <div className="topbar-actions">
        <span className="workspace-chip">PoC Workspace</span>
        <button type="button" className="icon-text-button" onClick={onLogout} aria-label="로그아웃" title="로그아웃"><Icon name="logout" size={18} /><span>로그아웃</span></button>
      </div>
    </header>
  );
});

export default Topbar;
