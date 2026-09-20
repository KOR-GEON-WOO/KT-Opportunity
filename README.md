# KT Opportunity V2

신규 음식점 영업 기회 발굴 및 맞춤 상품 설계 PoC입니다.

v6는 F-01~F-05 기능 구조를 내부 로직으로 유지하면서, 화면을 영업 직원의 실제 업무 흐름 중심으로 전면 재구성했습니다.

## 주요 UX

- 영업 홈 Dashboard
- 신규 음식점 Master–Detail 탐색
- 직원 확인 + 규칙 기반 상품 기회를 한 화면에서 실시간 표시
- AI 모델 정보는 기본 업무 화면에서 분리하고 Agent details에서 확인
- 매장 Context 유지
- 상담 Draft 세션 자동 보존
- 상담 이력 append-only 저장
- 모바일 Bottom Navigation

## 데이터 원칙

- 직원이 확인하지 않은 개업/계약/설치 상태는 UNKNOWN
- F-03 상품 판단은 결정 규칙으로 처리
- 검수된 KT 상품 데이터만 구체 상품명/가격/가입 조건에 사용
- 상담 이력은 기존 기록을 덮어쓰지 않고 누적

## 실행

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Production:

```bash
npm run build
```

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

`VITE_*`에는 API Key나 LLM Credential을 넣지 않습니다.
