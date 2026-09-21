# KT Opportunity — Runbook

## Development

Install dependencies:

    npm ci

Start development server:

    npm run dev

## Validation

Before release or baseline update:

    npm test
    npm run build
    npm audit
    git diff --check

## Data Modes

### Mock

Development 및 PoC 검증용:

    VITE_DATA_MODE=mock

### n8n

실제 Gateway 연동용:

    VITE_DATA_MODE=n8n
    VITE_N8N_BASE_URL=https://<authenticated-gateway>

브라우저 환경변수에 다음 정보를 포함하지 않는다.

- API key
- n8n credential
- Local LLM token
- private key
- direct vLLM endpoint
- direct llama.cpp endpoint

## F-04 Runtime

Canonical workflow ID:

`bc1M3h3YGIUWKm1n`

Runtime order:

HyperCLOVA X
→ VRAM release / model switch
→ KT Mi:dm

한 시점에 하나의 Local LLM만 GPU VRAM에 상주한다.

## Release Validation

다음을 모두 확인한다.

- npm ci 성공
- npm test 성공
- npm run build 성공
- npm audit에서 새 High/Critical 취약점 없음
- git diff --check 성공
- secret / credential / environment file 검사
- product version metadata consistency
- README consistency
- VERSION_LINEAGE consistency
- ROADMAP_V2_5 consistency
- ARCHITECTURE consistency
- F04_INTEGRATION consistency

## Explicit Approval Required

다음 변경은 사용자 명시 승인 대상이다.

- 실제 n8n workflow 수정 또는 실행
- authentication / authorization 변경
- secrets / credentials 변경
- public network exposure
- ngrok
- Docker / Compose production configuration
- Nginx production configuration
- systemd service
- CI/CD workflow
- database / schema migration
- destructive state migration
