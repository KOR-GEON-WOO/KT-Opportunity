# KT Opportunity

KT Enterprise 영업 담당자를 위한 검색 → 전체 매장 → 근거 상세 워크스페이스. 현재 구현은 **A 범위의 로컬 합성 데모**입니다. 실제 조회·저장·직원 이벤트는 연결하지 않았습니다. 기존 Cloudflare Pages의 작업 브랜치 미리보기를 사용하며 운영 반영은 별도입니다.

## 실행

Node.js와 npm이 필요합니다. 현재 검증 환경은 Node 26.10.0 / npm 11.19.1입니다.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

[로컬 화면](http://127.0.0.1:5173/)에서 지역·기간을 입력하고 **데모 매장 찾기**를 누릅니다. **데모 응답 설정**에서 0건·확인 필요·오류·결과 미확인 등을 선택할 수 있습니다. LIVE 선택은 연결 미설정 오류만 표시하며 외부 요청이나 데모 fallback을 하지 않습니다.

라이트·다크·시스템 선택은 헤더의 **화면 테마**에서 제공합니다. 테마 선호만 localStorage에 저장하며 매장·검색 결과는 메모리에만 유지합니다.

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
- `src/features/entities/EntityDetail.jsx`: 매장 정보·Fact·출처 비교·초안 연결 요약.
- `src/domain/`, `src/services/`: 기존 응답 변환·데모 서비스 유지. `entities` 기준 목록과 `entityId` 조인.
- `src/components/`, `src/tokens/`, `public/theme-bootstrap.js`: 테마·상태 컴포넌트·초기 적용.
- `tests/`: 계약·실패 상태·브라우저 흐름·반응형·접근성 회귀.

[구현·검증 보고서](docs/first-path-verification.md)에 변경 파일과 미검증 사항을 기록했습니다. Fact 수정·제안 수정(B), 상품 상세·직원 승인·상담·후속, 실제 인증·API 연동은 후속 범위입니다.
