# KT Opportunity V3.2

> 현재 기준: **KT Opportunity V3.2 — Release Baseline**

KT Opportunity는 신규 음식점 영업 기회를 발굴하고,
매장 확인·상품 분석·맞춤 제안·후속 상담으로 이어지는
KT 영업 지원 React/Vite PoC다.

## Current release

현재 공식 릴리스는 **V3.2**다.

주요 범위:

- runtime / UX integration
- authenticated HTTPS Gateway boundary
- workflow / concurrency hardening
- data contract / workflow semantics
- validation / Sales Workspace integration
- F-04 KT 상품 catalog subset validation
- F-05 outbound contract validation
- Proposal / Follow-up operational error 및 recovery feedback
- `saveApproved=true` first-save gate
- `consultationId` 기반 idempotency
- KST ISO 8601 millisecond 상담 이력 contract
- Local LLM inference endpoint의 browser 직접 노출 금지

## Version history

공식 제품 계보:

`V0.1 → V0.2 → V0.3 → V0.4 → V1 → V1.1 → V1.2 → V2 → V2.1 → V2.2 → V3 → V3.1 → V3.2`

향후 V3 roadmap:

`V3.2 → V3.3 → V3.4 → V3 FINAL`

- [Full Changelog](CHANGELOG.md)
- [Official Version Lineage](docs/VERSION_LINEAGE.md)
- [V3.2 Release Baseline](docs/RELEASE_V3_2.md)

## Runtime contract

- HyperCLOVA X: vLLM
- KT Mi:dm: llama.cpp
- 12GB VRAM에서 한 번에 하나의 모델만 상주
- F-04 모델 실행은 server-side sequential Queue를 전제로 한다.
- browser에서 vLLM / llama.cpp inference endpoint 직접 호출 금지
- authenticated HTTPS Gateway / n8n session boundary 유지

KT Mi:dm의 vLLM migration은 완료된 것으로 간주하지 않는다.

## Validation

```bash
npm test
npm run build
```

세부 release 기준은 `docs/RELEASE_V3_2.md`를 참조한다.
