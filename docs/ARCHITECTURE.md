# KT Opportunity — Current Architecture

## Overview

KT Opportunity는 신규 음식점 영업 기회를 발굴하고,
직원 확인 정보와 검수된 KT 상품 기준을 활용해 맞춤 상담안을 만드는 Agent이다.

application layer와 Local LLM inference layer는 분리한다.

## Client

React + Vite frontend

주요 흐름:

1. Discovery
2. Store verification
3. Product analysis
4. Proposal
5. Follow-up
6. History

브라우저는 Local LLM inference port를 직접 호출하지 않는다.

## Gateway / Workflow Boundary

Client
→ authenticated HTTPS Gateway
→ n8n
→ FastAPI / Local runtime boundary
→ Local LLM

실제 n8n F-04 workflow:

- Workflow: KT Opportunity F-04
- Workflow ID: `bc1M3h3YGIUWKm1n`
- Environment: `kluee007.app.n8n.cloud`

실제 n8n workflow의 수정 또는 실행은 별도 사용자 승인 대상이다.

## F-04 Local LLM Pipeline

12GB VRAM 환경에서는 두 모델을 동시에 GPU에 상주시킬 수 없다는 전제를 유지한다.

실행 순서:

HyperCLOVA X
→ inference complete
→ VRAM release
→ runtime/model switch
→ KT Mi:dm
→ inference complete

원칙:

- 한 시점에 하나의 모델만 GPU VRAM에 상주
- HyperCLOVA X runtime: vLLM
- KT Mi:dm runtime: llama.cpp
- Mi:dm의 실제 migration 완료 전까지 llama.cpp로 기록
- browser에서 vLLM / llama.cpp inference endpoint 직접 호출 금지

## Current Repository Scope

현재 저장소에 포함되는 주요 영역:

- React frontend
- domain rules
- runtime response contracts
- n8n client adapter
- mock API
- gateway policy
- persistence utilities
- regression / smoke tests
- deployment reference

현재 저장소에는 검증된 FastAPI backend 구현이 존재한다고 가정하지 않는다.

FastAPI가 외부 component라면 V3.0에서 정확한 contract와 runbook을 확정한다.

## Protected Business Rules

- F-01~F-05 workflow
- R-01~R-30 rules
- OPEN / PREPARING / CLOSED / UNKNOWN
- CONTRACTED / NOT_REQUIRED / UNDECIDED / UNKNOWN
- INTERNET installStatus=PASS
- saveApproved=true first-save gate
- storeId update semantics
- KST ISO 8601 millisecond consultation history
- consultationId idempotency
- catalog subset validation
- no hallucinated KT products
