# KT Opportunity V2.1

신규 음식점 영업 기회 발굴 및 맞춤 상품 설계 PoC입니다.

v6는 F-01~F-05 기능 구조를 내부 로직으로 유지하면서, 화면을 영업 직원의 실제 업무 흐름 중심으로 전면 재구성했습니다. v6.1은 실제 사용 중 발생할 수 있는 상태·API 계약·인증·pagination 문제를 보완한 안정화 버전입니다.

## 주요 UX

- 영업 홈 Dashboard
- 신규 음식점 Master–Detail 탐색
- 직원 확인 + 규칙 기반 상품 기회를 한 화면에서 실시간 표시
- AI 모델 정보는 기본 업무 화면에서 분리하고 Agent details에서 확인
- 매장 Context 유지
- 상담 Draft 세션 자동 보존
- 상담 이력 append-only 저장
- 모바일 Bottom Navigation

## v6.1 안정화

- Dashboard에서 실데이터 0건을 Mock 데이터로 대체하지 않음
- Dashboard 지표는 현재 조회/세션 상태만 계산
- 새 검색 후 후보 목록 pagination 자동 초기화
- 직원 확인 전 `checkedAt` 미기록, 실제 수정 시 KST 확인일 기록
- LOCALDATA 기본 조회 종료일을 D-2로 설정
- 저장된 매장 확인 상태를 같은 세션에서도 즉시 반영
- n8n 응답 runtime schema 검증
- n8n 모드에서 서버 로그인/로그아웃 Webhook 사용
- Mock 세션과 n8n 세션 혼용 방지
- Agent validation 미수신 값을 PASS로 추정하지 않음
- n8n 모드 로딩 단계에서 내부 서버 진행상황을 임의로 추정하지 않음
- 모바일/접힘 Sidebar 접근성 label과 주요 터치 영역 보강

## 데이터 원칙

- 직원이 확인하지 않은 개업/계약/설치 상태는 UNKNOWN
- F-03 상품 판단은 결정 규칙으로 처리
- 검수된 KT 상품 데이터만 구체 상품명/가격/가입 조건에 사용
- 상담 이력은 기존 기록을 덮어쓰지 않고 누적

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

첫 `npm install` 실행 후 생성되는 `package-lock.json`은 저장소에 함께 보관하는 것을 권장합니다. 직접 dependency 버전은 v6.1에서 고정했습니다.

## 데이터 모드

기본값은 Mock입니다.

```env
VITE_DATA_MODE=mock
```

n8n 연동:

```env
VITE_DATA_MODE=n8n
VITE_N8N_BASE_URL=https://your-gateway.example.com
```

n8n 모드에서는 로그인 시 `/webhook/auth/login`이 성공해야 업무 화면으로 진입합니다. 실제 인증정보는 HttpOnly Cookie 또는 Cloudflare Access에서 관리하고 `VITE_*`에는 API Key나 LLM Credential을 넣지 않습니다.
