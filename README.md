# KT Opportunity

KT Enterprise 영업 담당자를 위한 검색 → 전체 매장 → 근거 상세 워크스페이스. 현재 구현은 **A 검색·상세와 B Fact 보완·제안 수정의 합성 데모**입니다. 실제 조회·저장·직원 이벤트는 연결하지 않았습니다. A와 B는 GitHub 작업 브랜치·PR 및 기존 Cloudflare Pages 미리보기로 검토합니다. 배포별 성공 여부와 확인한 URL은 해당 PR에서 확인합니다.

## 실행

Node.js와 npm이 필요합니다. 현재 검증 환경은 Node 26.10.0 / npm 11.19.1입니다.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

[로컬 화면](http://127.0.0.1:5173/)에서 지역·기간을 입력하고 **데모 매장 찾기**를 누릅니다. **데모 응답 설정**에서 0건·확인 필요·오류·결과 미확인 등을 선택할 수 있습니다. LIVE 선택은 연결 미설정 오류만 표시하며 외부 요청이나 데모 fallback을 하지 않습니다.

매장 상세에서 **매장 사실 보완**을 누르면 변경한 항목만 데모로 반영하고 직원 확인 근거를 추가합니다. **제안 수정 요청**에서는 표현 수정 또는 새 사실 반영을 선택합니다. 수정 사유가 필요하며 새 초안 성공 때만 이전 제안을 이전 버전으로 바꿉니다. **이번 세션의 제안**에서 이전 버전을 읽을 수 있습니다. 각 편집 창의 **데모 검증 설정**에서 오류·무초안·응답 단절도 시험할 수 있습니다.

라이트·다크·시스템 선택은 헤더의 **화면 테마**에서 제공합니다. 테마 선호만 localStorage에 저장하며 매장·검색 결과와 편집 결과는 메모리에만 유지합니다. 수정 응답에 최신 Entity 전체가 없으면 기존 매장 정보의 시점을 안내하고 추가 Fact 편집을 잠급니다. 최신 조회·직원 인증·실제 쓰기는 미연결입니다.

## 검증

```sh
npm test
npm run lint
npm run build
npm run test:e2e
```

브라우저 테스트는 설치된 macOS Google Chrome을 우선 사용합니다. 다른 환경은 `CHROME_PATH`로 실행 파일을 지정하거나 `npx playwright install chromium`으로 테스트용 Chromium을 설치합니다. Playwright가 로컬 서버를 시작하며, 이미 실행 중인 5173 서버는 재사용합니다. 결과는 `test-results/`에 저장됩니다. 실제 n8n·Sheets 호출은 하지 않습니다.

빌드 출력은 `dist/`, 미리보기는 `npm run preview`입니다. 2026-10-03 Cloudflare 관리 화면에서도 빌드 `npm run build` / 출력 `dist`를 확인했습니다. 운영은 `main`, 미리보기는 모든 비운영 브랜치의 자동 배포입니다. 운영 반영이나 PR 병합은 이번 범위에 포함하지 않습니다.

## 구조와 범위

- `src/App.jsx`: 요청 상태, 세션 결과, 필터, 매장 선택·모바일 복귀.
- `src/features/discovery/GoalForm.jsx`: 조건 검증, 전송 문장 미리보기, 데모 시나리오.
- `src/features/entities/`: 매장 정보·출처 비교·9개 Fact 편집·변경 전후 비교.
- `src/features/proposals/`: 상담안·상품 응답 조회, 이전 제안 선택, 수정 창과 실패 상태.
- `src/domain/`, `src/services/`: 기존 응답 변환·데모 서비스 유지. `entities` 기준 목록과 `entityId` 조인.
- `src/components/`, `src/tokens/`, `public/theme-bootstrap.js`: 테마·상태 컴포넌트·초기 적용.
- `tests/`: 계약·실패 상태·브라우저 흐름·반응형·접근성 회귀.

[A 보고서](docs/first-path-verification.md)와 [B 보고서](docs/facts-revision-verification.md)에 변경 파일과 검증 계층을 기록했습니다. 직원 승인·반려·상담·후속, 상품 판정 상세 조회, 실제 인증·API 연동은 후속 범위입니다. 작업 브랜치 Push와 PR 공유는 사용자 요청 범위이며, 운영 main 병합·운영 배포는 별도입니다.
