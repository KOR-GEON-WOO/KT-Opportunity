# v7.0 UI/UX 전면 개선

v6.2의 기능 로직과 API 계약은 유지하고 화면 표현 계층만 전면 재설계했다.

## 문제

- 본문·라벨·표·리스트가 10~13px에 집중되어 고해상도 노트북에서 과도하게 작게 보임
- 한국어 긴 제목/설명이 컨테이너 끝에서 한두 글자만 다음 줄로 넘어가는 경우가 있음
- 검색 조건 6개 이상을 한 행에 배치해 필드 폭이 지나치게 좁음
- Master/Detail에서 후보 목록 폭이 좁고 상세 화면은 정보 밀도가 높음
- 패널 제목·보조 설명·상태 Badge의 크기 차가 작아 정보 위계가 약함
- 1440px 이하에서 일부 영역은 단순 축소 위주라 읽는 순서가 불명확함

## 변경

- 본문 15px, 핵심 리스트 13~15px, 패널 제목 21~22px 기준으로 확대
- `word-break: keep-all`, `overflow-wrap: break-word`, `text-wrap: pretty/balance` 적용
- Search filter: 3열 → 2열 → 1열의 명시적 반응형 구조
- 후보 목록 기본 폭 370~410px, 대형 화면 420px
- 입력 높이 48px, 주요 버튼 46px 이상으로 확대
- Topbar 80px, Sidebar 276px 기준으로 업무 화면 밀도 재조정
- 카드 Padding 24~36px 범위로 확대하고 핵심 화면 간 Gap을 22px 기준으로 통일
- Proposal/Follow-up/History/Product 화면의 텍스트 및 표 가독성 확대
- 960px 이하 Sidebar drawer, 760px 이하 주요 1열 전환, 540px 이하 입력 16px 유지

## 기능 영향

없음. AgentProvider, n8n API, Mock API, validation, storage, F-01~F-05 상태 로직은 수정하지 않았다.
