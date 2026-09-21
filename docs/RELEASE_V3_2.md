# KT Opportunity V3.2 — Release Baseline

V3.2는 현재 KT Opportunity의 공식 release baseline이다.

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
- Release: V3.2
- Package version: 3.2.0
- Status: Release

다음 공식 릴리스는 V3.3이다.
