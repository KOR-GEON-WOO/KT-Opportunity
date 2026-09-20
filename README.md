# KT Opportunity V3.1

신규 음식점 영업 기회 발굴 및 맞춤 상품 설계 PoC입니다.

v7.0은 v6.2의 기능·데이터 검증 로직을 유지하면서 UI/UX를 전면 재설계한 버전입니다. 작은 글자, 과도한 정보 압축, 한국어 문장 끝의 어색한 줄바꿈, 좁은 Master–Detail 폭, 복잡한 필터 배치를 개선했습니다.

## v7.0 UI/UX 개선

- 기본 본문·폼·표 글자 크기 상향 및 행간 재조정
- 한국어 `word-break: keep-all` + `text-wrap` 적용으로 한두 글자만 다음 줄에 남는 현상 완화
- 6~7개 검색 조건을 한 줄에 압축하지 않고 3열/2열/1열로 단계적 재배치
- 음식점 후보 목록 폭 확대 및 행 높이·메타 정보 간격 개선
- 상세 패널·상품 분석·제안·상담 기록 화면의 제목/본문 계층 재설계
- Sidebar/Topbar/CTA 터치 영역 확대
- 2560px 대형 화면부터 320px 모바일까지 반응형 간격 재정의
- 로그인 화면의 헤드라인 폭·크기·카드 대비 재조정

## 주요 UX

- 영업 홈 Dashboard
- 신규 음식점 Master–Detail 탐색
- 직원 확인 + 규칙 기반 상품 기회를 한 화면에서 실시간 표시
- AI 모델 정보는 기본 업무 화면에서 분리하고 Agent details에서 확인
- 매장 Context 유지
- 상담 Draft 세션 자동 보존
- 상담 이력 append-only + consultationId idempotency
- 모바일 Bottom Navigation

## v6.2 안정화

- 인증 fail-open 제거
- `status:ERROR`, `ok:false`, `success:false` 처리
- 검색/Proposal/History/Product catalog 항목 단위 runtime schema 검증
- 상담 저장 `consultationId` 도입 및 중복 append 방지
- Proposal/폼 변경 시 저장 승인 자동 무효화
- n8n 매장 확인 상태 복원 endpoint 추가
- 서버 보정 verification을 실제 UI state에 반영
- n8n 상품 catalog endpoint 추가
- Mock 데모 기준일 고정으로 날짜 time-bomb 제거
- 검수 상품 0건일 때 잘못된 `검수 완료` Badge 제거
- 401/403 세션 만료 처리
- 대량 Restaurant 결과 sessionStorage 저장 제한 및 경고
- 기술 Enum 사용자 문구 노출 제거

상세 내용은 `docs/FIXES_V6_2.md`와 `docs/API_CONTRACT.md`를 참고합니다.

## 데이터 원칙

- 직원이 확인하지 않은 개업/계약/설치 상태는 UNKNOWN
- F-03 상품 판단은 결정 규칙으로 처리
- 검수된 KT 상품 데이터만 구체 상품명/가격/가입 조건에 사용
- 상담 이력은 기존 기록을 덮어쓰지 않고 누적
- 동일 `consultationId` 재시도는 중복 상담으로 저장하지 않음

## 실행

```bash
npm install
npm run test:smoke
npm run dev -- --host 0.0.0.0
```

Production:

```bash
npm run build
```

첫 `npm install` 실행 후 생성되는 `package-lock.json`은 저장소에 함께 보관하는 것을 권장합니다. 직접 dependency 버전은 고정되어 있습니다.

## 데이터 모드

기본값은 Mock입니다.

```env
VITE_DATA_MODE=mock
```

Mock 모드는 기능기술서 PoC 스냅샷과 맞추기 위해 `2026-09-18`을 데모 기준일로 사용합니다. 실제 n8n 모드에서는 현재 KST 날짜를 사용합니다.

n8n 연동:

```env
VITE_DATA_MODE=n8n
VITE_N8N_BASE_URL=https://your-gateway.example.com
```

n8n 모드에서는 다음 endpoint가 필요합니다.

- `/webhook/auth/login`
- `/webhook/auth/logout`
- `/webhook/restaurant/interpret`
- `/webhook/restaurant/search`
- `/webhook/restaurant/status`
- `/webhook/restaurant/verify`
- `/webhook/restaurant/analyze`
- `/webhook/restaurant/proposal`
- `/webhook/restaurant/follow-up`
- `/webhook/restaurant/history`
- `/webhook/restaurant/products`

실제 인증정보는 HttpOnly Cookie 또는 Cloudflare Access에서 관리하고 `VITE_*`에는 API Key나 LLM Credential을 넣지 않습니다.
