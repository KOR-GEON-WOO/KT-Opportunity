# KT Opportunity — F-04 Integration

## Canonical Workflow

실제 n8n F-04 workflow:

- Name: KT Opportunity F-04
- Workflow ID: `bc1M3h3YGIUWKm1n`
- Environment: `kluee007.app.n8n.cloud`

이 workflow를 F-04 orchestration의 실제 operational reference로 사용한다.

실제 workflow의 내부 node 구성은 검증된 export 없이 추정하지 않는다.

## Intended Runtime Flow

Frontend
→ authenticated HTTPS Gateway
→ n8n F-04
→ FastAPI / Local runtime boundary
→ HyperCLOVA X
→ VRAM release / model switch
→ KT Mi:dm
→ validated proposal response

## Model Runtime

### HyperCLOVA X

- Inference engine: vLLM

### KT Mi:dm

- Inference engine: llama.cpp
- 실제 migration 완료 전까지 vLLM으로 표시하지 않는다.

### GPU Policy

- Target GPU VRAM: 12GB
- single-resident model policy
- 두 Local LLM을 동시에 VRAM에 상주시키지 않는다.

## Trust Boundary

F-04 proposal 결과는 frontend trust boundary에서 다시 검증한다.

- runtime response schema
- productCode
- productCategory
- productName
- verified catalog subset

검수 catalog에 존재하지 않는 KT 상품은 정상 제안으로 수용하지 않는다.

## Integration Status

| Component | Status |
|---|---|
| React frontend | LIVE CODE |
| Mock API | LIVE CODE |
| Frontend n8n adapter | LIVE CODE |
| Runtime response validation | LIVE CODE |
| Gateway safety policy | LIVE CODE |
| Actual n8n F-04 workflow | EXTERNAL LIVE REFERENCE |
| Sanitized F-04 workflow snapshot in Git | NOT YET STORED |
| Verified FastAPI backend in this repository | NOT IMPLEMENTED / NOT VERIFIED |
| HyperCLOVA X vLLM runtime | EXTERNAL LOCAL RUNTIME |
| KT Mi:dm llama.cpp runtime | EXTERNAL LOCAL RUNTIME |
| Full production E2E validation | NOT YET VERIFIED |

상태는 실제 검증 결과에 따라서만 변경한다.
추정이나 계획만으로 LIVE 상태를 부여하지 않는다.

## Change Control

다음 작업은 사용자 명시 승인 없이 수행하지 않는다.

- 실제 n8n Cloud workflow 수정 또는 실행
- authentication / authorization 변경
- credentials / secrets 변경
- public gateway exposure
- ngrok exposure
- production Docker / Nginx / systemd 변경
- CI/CD release automation
