# KT Opportunity — V3 Roadmap

## Current baseline

Current official baseline: **V2.4 FINAL**

V3.x의 남은 개발은 V3.3과 V3.4 두 릴리스로 압축한다.

## V3.3 — Integration Foundation

목표:
현재 제품의 mock, frontend contract, 실제 n8n F-04, Local LLM runtime 사이의 경계를 명확히 하고
V3.4의 실제 통합을 견딜 수 있는 기반을 완성한다.

### Developer

- F-01~F-05 및 핵심 R-01~R-30 regression coverage
- contract / business invariant / persistence / idempotency / gateway test 구조화
- 실제 F-04 input/output contract 정리
- LIVE / MOCK / PLANNED / UNKNOWN integration matrix
- production에서 잘못된 mock fallback 방지
- persistence / session recovery / retry / timeout / error semantics
- data provenance / freshness / UNKNOWN semantics
- runtime adapter boundary 정리
- HyperCLOVA X → VRAM release/switch → KT Mi:dm 순차 실행 계약 보존

### Designer

- Discovery → Analysis → Proposal → Follow-up → History 흐름 정리
- Live / Mock 상태 명확화
- queue / model switch / loading / retry / recovery / save 상태 표현
- verified data와 AI interpretation 구분
- desktop / tablet / mobile
- keyboard / focus / touch / accessibility
- 긴 한국어 텍스트 / wrapping / overflow / density 개선

## V3.4 — Final V3 / Pilot Ready

목표:
실제 운영 경로를 최종 통합하고 V3.x를 종료한다.

### Developer

- frontend → gateway → n8n F-04 → FastAPI/runtime → Local LLM pipeline 통합
- 실제 구현 여부에 따른 FastAPI contract/runbook 확정
- request/correlation tracing
- timeout / cancellation / retry / duplicate / partial failure
- model-switch failure / recovery / session resume
- deterministic error taxonomy
- provenance / freshness / validation / UNKNOWN
- final security / dependency / performance / regression hardening
- architecture / F-04 integration / runbook / release documentation 완성

### Designer

- 전체 영업 workflow 최종 audit
- progress / queue / model-switch / retry / recovery 표현
- proposal / evidence / save / history clarity
- Live / Mock 최종 구분
- responsive / accessibility / long Korean text 최종 QA
- misleading / duplicate / dead-end UI 제거

## V3 FINAL HOLD

V3.4가 main에 반영되고 사용자가 공식 V3.4 tag를 승인한 뒤:

- 추가 V3.x release 금지
- V4.0 자동 시작 금지
- V4.0은 사용자 명시 승인 후 시작
