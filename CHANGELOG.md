# KT Opportunity — Changelog

이 문서는 KT Sales Agent에서 KT Opportunity로 이어지는
공식 제품 릴리스 변경사항을 기록한다.

## Official product evolution

`V0.1 → V0.2 → V0.3 → V0.4 → V1 → V1.1 → V1.2 → V2 → V2.1 → V2.2 → V3 → V3.1 → V3.2`

향후 V3 roadmap:

`V3.2 → V3.3 → V3.4 → V3 FINAL`

---

## V3.2 — Release Baseline

- **Product:** KT Opportunity
- **Release:** V3.2
- **Package version:** `3.2.0`
- **Status:** Release

### 주요 변경

- Runtime / UX integration 및 mobile viewport 대응
- authenticated HTTPS Gateway boundary
- Local LLM direct-call 차단
- navigation / focus / touch hardening
- 검색 / Proposal / 저장 concurrency 제어
- `consultationId` 기반 idempotency
- KST ISO 8601 millisecond data contract
- 실제 도메인 상태 기반 Workflow Trail
- Sales Workspace validation integration
- F-04 KT 상품 catalog subset validation
- F-05 outbound contract validation
- operational error / recovery feedback
- `saveApproved=true` first-save gate
- smoke regression coverage 확대
- repository hardening
- Vite `7.3.6`

### Runtime policy

- HyperCLOVA X: vLLM
- KT Mi:dm: llama.cpp
- GPU VRAM에는 한 시점에 하나의 Local LLM만 상주
- browser에서 Local LLM inference endpoint 직접 호출 금지
- authenticated HTTPS Gateway / n8n session boundary 유지

### 영향 영역

Runtime · Gateway · Workflow · Concurrency · Data Contract · Validation · Sales Workspace · Operational UX · Testing

---

## V3.1 — Full UI/UX Audit

- **Product:** KT Opportunity
- **Historical release commit:** `a9b1220a8b7c52bf337073b98d9bf03b747ab10b`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- 전체 UI/UX audit 문서와 simulator를 추가했다.
- Dashboard, Discovery, Follow-up, History, Login, Products, Proposal 등 주요 화면을 desktop/mobile/wide 조건으로 캡처·검증했다.
- loading, empty, error, mobile drawer 등 상태별 audit 자료를 추가했다.
- audit 결과를 바탕으로 App/layout/sidebar/history/responsive 스타일을 보정했다.
- storage와 화면 상태 처리 일부를 함께 정리했다.
- 이 audit은 실제 프로젝트 CSS/컴포넌트를 사용한 정적 QA simulator 기반이며, React runtime 전체 E2E·실제 n8n 응답·실기기 브라우저 검증을 의미하지 않는다.

### 이전 버전 대비

V3의 전면 UI/UX 재설계를 다중 viewport·상태 조합의 정적 QA로 점검하고, 발견된 문제를 보완했다.

### 영향 영역

UI/UX Audit · Responsive · Accessibility-oriented QA · State · Documentation

---

## V3 — UI/UX Overhaul

- **Product:** KT Opportunity
- **Historical release commit:** `5f8beaec981395511364d265979fdf6d4a5dc70d`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- V2.2의 기능 및 데이터 검증 로직을 유지하면서 UI/UX를 전면 재설계했다.
- 작은 글자와 과도한 정보 압축을 완화했다.
- 한국어 문장 줄바꿈과 가독성 문제를 개선했다.
- Master–Detail 화면 폭과 필터 배치를 조정했다.
- base/features/layout/responsive/tokens CSS 계층을 전반적으로 재정비했다.
- UI QA 및 preview 문서를 갱신했다.

### 이전 버전 대비

V2.x에서 안정화한 제품 구조와 contract를 유지하면서 사용자 인터페이스 세대를 교체한 시각·상호작용 중심 release다.

### 영향 영역

UI/UX · Responsive · Typography · Layout · Documentation

---

## V2.2 — Reliability / API / State

- **Product:** KT Opportunity
- **Historical release commit:** `84c34b50efb02ff0b6a5be962dfecbe890bc5d82`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- Search/Proposal/History/Product catalog 항목 단위 runtime schema 검증을 강화했다.
- Proposal 또는 form 변경 시 기존 저장 승인을 자동 무효화하도록 상태 규칙을 보강했다.
- 매장 확인 상태 복원 및 서버 보정 verification을 UI state에 반영하는 흐름을 추가했다.
- n8n 상품 catalog contract를 확장했다.
- 상담 저장 idempotency와 상태 복원 로직을 강화했다.
- Mock 데모 기준일을 고정해 날짜에 따라 결과가 달라지는 time-bomb 문제를 줄였다.
- smoke test와 API contract 문서를 대폭 확대했다.

### 이전 버전 대비

V2.1의 안정화 작업을 contract, persistence, idempotency, catalog 일관성까지 확장했다.

### 영향 영역

Reliability · API Contract · State/Persistence · Idempotency · Testing · Product Catalog

---

## V2.1 — Stabilization

- **Product:** KT Opportunity
- **Historical release commit:** `f99be618c4f2c723977f0daceae3c333d0e1769a`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- 실제 데이터가 0건일 때 이를 Mock 데이터로 자동 대체하지 않도록 동작을 수정했다.
- n8n 응답 runtime schema 검증 계층을 추가했다.
- n8n 모드의 서버 로그인/로그아웃 webhook 경계를 정리했다.
- Mock session과 n8n session 혼용을 방지했다.
- n8n mode에서 서버 내부 진행상황을 클라이언트가 임의로 추정하지 않도록 loading semantics를 보완했다.
- `contracts.js` 및 `scripts/smoke.mjs`를 추가했다.
- API contract 문서를 확장했다.

### 이전 버전 대비

V2의 구조 개편 후 n8n mode의 API/session/state 경계에서 발생할 수 있는 불일치를 줄이는 안정화 release다.

### 영향 영역

Stabilization · API Contract · Session · Runtime Validation · Testing · UI State

---

## V2 — Product / Information Architecture Rewrite

- **Product:** KT Opportunity
- **Historical release commit:** `5bda6f4aa5a6e5b2901beda92f354ef2ea243508`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- 기존 page/component 중심 구조를 `features/*`, `components/layout/*`, `components/ui/*` 중심으로 전면 재구성했다.
- `AgentProvider`를 도입해 주요 Agent 상태와 workflow를 중앙화했다.
- Discovery, Follow-up, History, Products, Proposal을 독립 feature 영역으로 분리했다.
- 단일 `styles.css`를 base/features/layout/responsive/tokens 계층으로 분리했다.
- desktop/tablet/mobile navigation 구조를 재설계했다.
- F-01~F-05 업무 구조는 유지하면서 화면을 실제 영업 직원 workflow 중심으로 재구성했다.
- storage, validation, mock/n8n data client 구조도 새 정보 아키텍처에 맞춰 조정했다.

### 이전 버전 대비

V1.x의 기능형 KT Opportunity를 feature-based 제품 구조와 영업 workflow 중심 정보 아키텍처로 다시 설계했다.

### 영향 영역

Architecture · Information Architecture · Workflow · State · UI/UX · Responsive

---

## V1.2 — Responsive / Interaction QA

- **Product:** KT Opportunity
- **Historical release commit:** `08cbe2d80101d10b2a7f1c0931f91beed57e0c8e`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- `docs/UI_QA.md`를 추가해 반응형/상호작용 점검 기준을 문서화했다.
- Restaurant result/search/store verification 화면의 responsive behavior를 개선했다.
- CSS를 대폭 확장해 다양한 화면 폭에서의 배치와 가독성을 보완했다.
- Header/Sidebar/App의 interaction 및 layout 세부 동작을 정리했다.

### 이전 버전 대비

V1.1의 UI polish를 다양한 viewport의 responsive·interaction QA 기준까지 확장했다.

### 영향 영역

Responsive · Interaction QA · UI/UX · Documentation

---

## V1.1 — UI Polish / Accessibility

- **Product:** KT Opportunity
- **Historical release commit:** `4c6d081812f7fecf650d4eaf7042c35e8d6fd258`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- 로그인 메인 카피의 한글 단어 중간 줄바꿈을 줄이도록 제목 폭과 줄바꿈 규칙을 조정했다.
- 로그인/업무 화면의 KT 로고와 Sidebar의 `신규 영업 기회`를 F-01 메인 이동 동작에 연결했다.
- 단계 전환 시 화면 상단으로 이동하도록 해 긴 화면에서 다음 단계 시작 위치가 아래에 남는 문제를 줄였다.
- 한국어 제목에 `word-break: keep-all`을 적용하고 모바일/태블릿 타이포그래피를 보정했다.
- 버튼, 카드, 브랜드 lockup의 hover/focus feedback을 정돈했다.
- 이 버전의 공식 `Accessibility` 의미 라벨은 위 가독성·focus feedback·navigation 개선을 요약한 것이며, 별도 WCAG 적합성 인증이나 보조기술 전체 검증을 의미하지 않는다.

### 이전 버전 대비

V1의 KT Opportunity 업무 흐름은 유지하면서 로그인·navigation·가독성·focus feedback을 보완한 incremental release다.

### 영향 영역

UI/UX · Readability · Navigation · Focus Feedback · Login

---

## V1 — Project Pivot to KT Opportunity

- **Product:** KT Opportunity
- **Historical release commit:** `a21c9aeb301ea97fa7bbfba70d09bb124bf37484`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- 제품명을 **KT Sales Agent → KT Opportunity**로 변경했다.
- 건축물 기반 KT 인터넷 영업 후보지 발굴 workflow를 신규 음식점 Opportunity 발굴 workflow로 전환했다.
- `RestaurantSearchForm`, `RestaurantResults`, `StoreVerification`을 추가했다.
- `ProductRuleAnalysis`, `ProposalWorkspace`, `FollowUpForm`을 추가해 매장 검증 → 상품 분석 → 제안 → 후속관리 흐름을 구성했다.
- 기존 `useSalesAgent`를 제거하고 `useRestaurantAgent` 기반으로 workflow를 재구성했다.
- data client 계층을 추가하고 mock/n8n API 구조를 새로운 도메인에 맞게 변경했다.
- `docs/API_CONTRACT.md`, `.env.example`, KT Opportunity용 deployment naming을 도입했다.
- 기본 데이터 모드는 Mock으로 유지하고 `VITE_DATA_MODE=n8n` 기반 n8n mode를 별도 configuration 경계로 두었다.

### 이전 버전 대비

이 release는 단순 기능 추가가 아니라 제품 과제와 도메인을 교체한 **Project Pivot**이다. V0.x의 건축물 기반 방문 후보지 Agent에서 신규 음식점 영업 기회 발굴 및 맞춤 상품 설계 Agent로 전환했다.

### 영향 영역

Product Pivot · Domain · Workflow · API Contract · Deployment · UI/UX · State

---

## V0.4 — Reliability & Persistence

- **Product:** KT Sales Agent
- **Historical release commit:** `50c651d6fd9d48546726187d8bbc3aa14b2e6e36`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- `storage.js`를 추가해 브라우저 상태/persistence 기반을 도입했다.
- History 화면과 저장 결과 복원 흐름을 강화했다.
- `useSalesAgent` 상태 관리와 Mock API 흐름을 안정화했다.
- 승인/저장 UI와 loading state를 보완했다.
- Nginx deployment configuration과 배포 README를 추가했다.
- HTML metadata와 제품 설명을 정리했다.

### 이전 버전 대비

V0.3의 workflow integrity 위에 상태 보존, 이력, 저장 및 배포 관점의 안정성을 추가했다.

### 영향 영역

Persistence · History · Reliability · Deployment · Workflow · UI State

---

## V0.3 — Workflow Integrity

- **Product:** KT Sales Agent
- **Historical release commit:** `edf4cbb8d33461a45f31227564499cc315fc6d36`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- `useSalesAgent` hook을 추가해 Dashboard에 집중돼 있던 workflow 상태 관리를 분리했다.
- `ErrorState`를 추가해 실패 상태를 별도 UI로 표현했다.
- Mock API를 확장해 Agent workflow의 상태 전이와 예외 처리 범위를 넓혔다.
- Search, Loading, Recommendation, Header 등 주요 단계의 상태 표현을 개선했다.
- Dashboard를 재구성해 workflow orchestration 역할을 정리했다.

### 이전 버전 대비

V0.2의 시각·layout 개선에서 한 단계 더 나아가 Agent workflow의 상태 관리, 오류 처리, orchestration 일관성을 강화했다.

### 영향 영역

Workflow · State · Error Handling · Mock API · UI Feedback

---

## V0.2 — KT Brand UI / Responsive

- **Product:** KT Sales Agent
- **Historical release commit:** `f810dbe3524f3dd619af23d0158a1cb80e6c2be3`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- KT standard/white wordmark assets를 추가했다.
- Sidebar를 도입해 navigation 구조를 확장했다.
- Search, Candidate, Install Status, Priority, Recommendation, Approval 화면을 전반적으로 재배치했다.
- Dashboard 및 History의 정보 구조를 개선했다.
- 대규모 CSS 재설계를 통해 반응형 layout과 화면 밀도를 조정했다.
- loading 및 sales-script 표현을 개선했다.

### 이전 버전 대비

V0.1의 기능형 MVP를 유지하면서 KT 브랜드 표현, navigation, responsive UI를 중심으로 사용자 경험을 재정비했다.

### 영향 영역

KT Brand UI · Responsive · Navigation · Dashboard · Workflow Presentation

---

## V0.1 — Functional MVP

- **Product:** KT Sales Agent
- **Historical release commit:** `73f72f946b3aa5a01dcbd57eb0bfc93b1557173d`
- **Historical commit date:** 2026-09-21 (KST)

### 주요 변경

- React 19 + Vite 기반 최초 애플리케이션을 구성했다.
- 영업 지역, 건물 연식, 세대수, 건물 유형을 입력하는 후보지 검색 UI를 구현했다.
- 자연어 입력 영역과 상세 조건 validation을 구성했다.
- 건축물 후보 목록과 KT 인터넷 설치 가능 여부 `PASS`/`FAIL` 확인 단계를 구현했다.
- 설치 가능 후보만 대상으로 세대수·건물 연식을 이용한 방문 우선순위 계산 로직을 구현했다.
- Mi:dm 상품 추천 영역과 HyperCLOVA X 상담 스크립트 UI를 구성했다.
- 직원 최종 승인 후 저장하는 Human Review gate를 구현했다.
- Mock API 기반 검색·추천·저장·히스토리 흐름을 구성했다.
- n8n webhook 호출을 위한 초기 API client interface를 추가했다.

### 이전 버전 대비

최초 공식 MVP이므로 이전 제품 버전은 없다.

### 영향 영역

Frontend · Workflow · Validation · Mock API · Recommendation · Human Review

---
