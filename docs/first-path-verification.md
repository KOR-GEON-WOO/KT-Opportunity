# A 검색·목록·상세 구현과 검증

확인: 2026-10-03 (Asia/Seoul). 앱 버전 0.0.0, React/Vite/JavaScript/npm 유지.

## 범위와 보존

검색 조건 → 명시적인 합성 데모 → 전체 매장 목록 → 선택 매장 상세를 제공한다. 기존 `feat/a-demo-workspace`의 미커밋 A 구현을 재사용하고, 좁은 화면에서 사라지던 세션 초기화 안내를 복원했다. 원본·변경 전 파일과 검증 산출물은 저장소 밖 자료 폴더의 `work/web-a-push-20261003/`에 보관한다.

시작 HEAD는 `41b9520647e9a7693a9dfcd5e3d7e154e79e127f`, 원격 기본 브랜치는 `main`이다. 적용할 AGENTS.md는 checkout 및 조사한 상위 폴더에 없었다. 관계없는 외부 문서·실제 응답 원문·환경 설정·테스트 산출물을 커밋하지 않는다. 기존 도메인·서비스·부트스트랩·로고와 lockfile은 이번 보완에서 변경하지 않았다.

## 구현된 경로

- 구조화한 지역·기간을 `goalText`로 변환하고 전송 문장을 표시한다. 필수 조건·날짜 검증, KST 오늘/이번 주, IME 처리, 중복 제출 방지, 늦은 응답 무시, 대기 중단을 지원한다.
- 기본 출처는 `MOCK_FIXTURE`. 13개 시나리오로 정상 1건·0건·혼합·미일치·조건 확인·미지원·무초안·모델/저장/조회/형식 오류·결과 미확인을 구분한다. LIVE는 명시적 미설정 오류를 반환하며 데모로 전환하지 않는다.
- `entities` 전체 목록을 보존하고 `entityId`로 초안을 연결한다. 동일 주소·배열 순서·JS 객체의 예약 이름에 의존하지 않는다. UNKNOWN/false/0/null/빈 값을 구분한다.
- 매장 식별, 인허가일, Facts, 출처별 충돌 Evidence·수집 시각, 초안 연결 상태를 제공한다. 상품 상세와 직원 행동은 지원 범위를 명시한다.
- 라이트·다크·시스템 선호, React 이전 초기 적용, 저장소 예외, OS 변경, 탭 간 동기화, 키보드 dialog와 포커스 복원, reduced motion을 지원한다. 업무 데이터는 메모리에만 유지한다.
- 데스크톱 목록/상세 분할과 모바일 목록→상세→복귀를 제공한다. 태블릿·모바일에서도 새로고침 시 결과가 초기화된다는 안내를 유지한다.

## 변경 파일

| 영역 | 파일 |
|---|---|
| 화면·스타일 | `src/App.jsx`, `src/App.css`, `src/index.css` |
| 공통 UI·테마 | `src/components/ThemeControl.jsx`, `StatusTag.jsx`, `src/tokens/theme.css`, `public/theme-bootstrap.js`, `index.html` |
| 기능 | `src/features/discovery/GoalForm.jsx`, `src/features/entities/EntityDetail.jsx` |
| 데이터 | `src/domain/search.js`, `adapter.js`, `src/services/searchService.js`, `fixtures.js` |
| CI 원본 | `public/brand/kt-light.png`, `kt-dark.png` |
| 검증·개발 | `tests/domain.test.js`, `tests/browser/workspace.spec.js`, `playwright.config.js`, `package.json`, `package-lock.json`, `.gitignore` |
| 인계 | `README.md`, 이 보고서; 외부 MD의 01·03은 자료 폴더에서 별도 갱신 |

## 디자인 근거

제공 `KT_CI_V5.1.zip`의 PDF를 렌더링해 보호 공간·배경·원본 비율을 확인했다. 두 PNG는 ZIP의 Standard_01/02와 byte 동일하며 재색칠·필터·재작화하지 않았다. 인쇄 mm 규격을 CSS px로 임의 환산하지 않았다. CI 원본 PDF/AI/ZIP은 배포하지 않는다.

[KT Color](https://uxdesign.kt.com/054231ea3/p/30fed2-color)와 [KT Accessibility](https://uxdesign.kt.com/054231ea3/p/378fd4-accessibility)의 본문을 2026-10-03 다시 확인했다. 회색 중심 위계, 절제된 강조색, 대비·키보드·터치·모션 감소 원칙을 적용한다. 구체적인 palette·치수·모션은 외부 05 문서의 **프로젝트 토큰**이며 KT 전사 공식 토큰으로 주장하지 않는다. 원본 로고와 대비를 보강한 CTA 색상을 구분하고 시스템 한글 폰트를 사용한다.

## 실행 검증

| 검증 | 결과 |
|---|---|
| `npm test` | PASS 11개: 타입·wrapper·ID·조인·오류·시간대·URL·모드·abort |
| `npm run lint` | PASS |
| `npm run build` | PASS: JS 255.54 kB / gzip 79.96 kB, CSS 15.28 kB / gzip 3.95 kB |
| `npm run test:e2e` | PASS 23개, Google Chrome 154.0.8037.93 headless |
| 반응형 | 양 테마 360/390/768/1024/1440 CSS px, 긴 이름·주소, 목록/상세·복귀·필터 |
| 확대·접근성 | 데스크톱 및 390px에서 root 글자 200%, 키보드·포커스·dialog·reduced motion, 대표 실제 대비·44px control 높이 |
| 상태 보존 | 테마 변경, 오류 뒤 이전 성공 결과·입력 보존, 세션 경계, 저장소 거절·invalid 선호·OS 변경 |
| 데이터 안전 | 합성 경로 외부 request 0, pageerror 0, HTML plain text·위험 protocol 차단 |
| 과거 로컬 응답 | `execution-3237.json` parser 재대조: 매장 3 / MATCH 1 / 확인 필요 2 / 초안 1. LIVE HTTP 시험은 아님 |
| 빌드 브라우저 확인 | `npm run preview`의 4173 화면에서 검색·전체 결과를 앱 내장 브라우저로 확인 |

모바일 세션 안내 회귀는 양 테마에서 처음 FAIL했고 CSS 보완 후 PASS했다. 실패 증거는 외부 `mobile-before-fix/`, 최종 결과는 `browser-final/`, 종합은 `verification-summary.json`에 보관한다. `test-results/`는 다음 실행 때 덮어써질 수 있다.

관련 AT-01~11, AT-29/34~38/43~49는 **A에 해당하는 L1 로컬 UI 범위**만 검증했다. AT-50도 UX-01~05 범위다. 서버 검색계획·resolver·실제 저장·전체 UX-01~11의 PASS로 확장하지 않는다.

## Push 전 배포 설정 확인

인증된 Cloudflare Pages `kt-opportunity` 관리 화면에서 확인했다. 설정은 변경하지 않았다.

- 연결 저장소: `KOR-GEON-WOO/KT-Opportunity`.
- 운영: `main`, 자동 배포 사용. Push 전 운영 커밋 `41b9520`, deployment `c4fffb3a-2511-45c6-a7af-8af23826a07b`.
- 미리보기: **프로덕션이 아닌 모든 브랜치**. 작업 브랜치 Push는 미리보기 배포 대상이다.
- 빌드 `npm run build`, 출력 `dist`, root는 저장소 루트, build system v3, 감시 경로 `*`.
- 작업 브랜치에만 Push하고 PR을 생성한다. 운영 브랜치 Push·PR 병합·Cloudflare 설정 변경은 제외한다. 실제 Push/배포 결과는 PR과 외부 01 현황에 기록한다.

## 남은 사항

B의 Fact 보완·제안 수정, 승인·상담·후속은 별도 요청 범위다. 서버 API/인증/직원 신원/upstream 보호, 실제 HTTP 계약·timeout, Sheets 저장, 상품 상세와 최신 이력 read 계약은 미연결·미검증이다. GAP-01~07을 유지한다.

Safari/Firefox/Edge/Whale 전체 회귀, 실물 모바일·가상 키보드·VoiceOver 낭독, 브라우저 메뉴의 200% zoom, 성능 프로파일은 NOT TESTED다. 화면의 지역 입력은 형식 검증이며 실제 행정구역 조합 유효성을 보장하지 않는다. n8n·Sheets에 접근하거나 쓰기 시험을 하지 않았다.
