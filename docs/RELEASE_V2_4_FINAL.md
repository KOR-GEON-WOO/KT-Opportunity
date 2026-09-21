# KT Opportunity V2.4 FINAL — Release Baseline

V2.4 FINAL는 현재 KT Opportunity의 공식 release baseline이다.

## Release Scope

- Runtime / UX integration
- HTTPS Gateway boundary
- navigation / focus / touch hardening
- workflow / concurrency / idempotency guard
- data contract / workflow semantics
- Sales Workspace validation integration
- F-04 proposal trust-boundary validation
- verified KT product catalog subset validation
- F-05 outbound contract validation
- operational error and recovery feedback
- `saveApproved=true` first-save gate
- `consultationId` idempotency
- KST ISO 8601 millisecond consultation history
- authenticated n8n session boundary
- single-resident Local LLM runtime policy

## Local LLM Runtime

F-04의 Local LLM 실행 정책:

HyperCLOVA X
→ VRAM release / model switch
→ KT Mi:dm

- HyperCLOVA X: vLLM
- KT Mi:dm: llama.cpp
- 한 시점에 하나의 모델만 GPU VRAM에 상주
- browser에서 inference endpoint 직접 호출 금지

## Version Identity

- Product: KT Opportunity
- Release: V2.4 FINAL
- Package version: 2.4.0
- Status: Release

다음 개발 단계는 V2.5 Foundation이다.
