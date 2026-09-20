# UI QA / Responsive Simulation — v5.2

이 문서는 v5.2에서 적용한 반응형 레이아웃 점검 기준이다.

## 기준 Viewport

- 2048px: 대형 데스크톱
- 1440px: 일반 데스크톱
- 1280px: 소형 데스크톱
- 1100 / 1024px: 노트북·가로 태블릿 경계
- 900 / 768px: 태블릿
- 700 / 520px: 모바일 전환 경계
- 390 / 320px: 스마트폰

## 점검 결과

### Login
- 2048/1440: 제목 2줄 고정, 한글 음절 단독 줄바꿈 방지
- 1280: 50/50 분할 + 제목 폭 확보
- 1100~901: 제목 line nowrap 해제, 좌우 50/50에서 수평 overflow 방지
- <=900: Dark visual panel 제거, 단일 컬럼 전환
- <=520: Header lockup과 CTA를 작은 화면에 맞게 축소

### Header / Navigation
- 1180 이하: 상단 메뉴 대신 Sidebar/모바일 내비게이션 사용
- 900 이하: Sidebar 제거, Bottom navigation 사용
- 520 이하: 브랜드 텍스트를 숨기고 KT 로고 + 로그아웃만 유지
- KT 로고는 항상 Agent F-01 메인으로 이동

### F-01 Search
- 1440+: 검색조건 4열
- 1280~901: 3열
- <=700: 2열
- <=520: 1열
- 모바일 input은 16px로 iOS 자동 확대 방지
- 결과 테이블은 Desktop, 카드형은 Mobile로 분리

### F-02 Verification
- 데스크톱: Store Profile + Verification 2열
- 1280~901: 왼쪽 290px + 가변 Form
- <=900: 1열
- Segmented Control은 데스크톱 4열, 협소 구간 2열
- 터치 버튼 최소 높이 42~44px

### F-03 Rule Engine
- 데스크톱: 추천/제외/추가확인 3열
- <=900: 1열
- 상태 코드와 설명의 최소 글자 크기를 상향

### F-04 Proposal
- 대형 데스크톱: 전략 + 상품 2열
- <=1280: 1열
- Product row는 화면 폭에 따라 4열 → 3열 → 2열
- 모델 전환 Flow는 필요 시 자체 horizontal scroll

### F-05 / History
- 데스크톱: Context + Form 2열
- <=900: 1열
- <=520: 액션 버튼 full-width
- History table은 모바일에서 table 자체만 horizontal scroll

## v5.2에서 제거한 주요 위험

- 한국어 제목이 `연결합니 / 다.`처럼 음절 단위로 끊기는 현상
- 901~1100px Login grid의 min-width 합산으로 생길 수 있는 수평 overflow
- 320~520px Header 브랜드 문자열과 로그아웃 버튼 충돌
- 모바일에서 8~10px에 머물던 업무 텍스트
- F-02 상태 버튼의 지나치게 작은 터치 타깃
- 좁은 화면의 검색 폼 2열 강제 유지
- Drawer가 열린 상태에서 background page가 함께 스크롤되는 문제
- 원천 데이터 Drawer의 Escape 닫기 미지원

