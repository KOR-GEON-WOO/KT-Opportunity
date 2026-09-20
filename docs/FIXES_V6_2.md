# v6.2 안정화 변경사항

이번 버전은 v6.1 추가 버그 리포트에서 확인된 fail-open, 중복 저장, runtime schema, 상태 복원, catalog source-of-truth 문제를 보완한다.

## 수정 항목

- 인증 응답 fail-open 제거. `ok:false`, `authenticated:false`, `status:ERROR`는 로그인 성공으로 보정하지 않는다.
- HTTP 200이어도 `status:ERROR`, `ok:false`, `success:false`를 실패로 처리한다.
- Restaurant item의 중복 `storeId`, 잘못된 `permitDate`를 차단한다.
- Proposal product item, History item, Product catalog item을 항목 단위로 검증한다.
- F-05에 `consultationId`를 도입하고 Mock 저장도 동일 ID 재시도를 append하지 않는다.
- Proposal 변경 또는 상담 폼 수정 시 `saveApproved`를 자동 해제한다.
- n8n 매장 확인 상태 복원 endpoint `/webhook/restaurant/status`를 추가했다.
- 서버가 보정한 verification 응답을 화면 state에도 그대로 반영한다.
- n8n 상품 기준 endpoint `/webhook/restaurant/products`를 추가해 상품 기준 화면의 source of truth를 서버로 이동할 수 있게 했다.
- Mock 모드는 2026-09-18을 명시적 데모 기준일로 사용해 시간이 지나도 기본 검색과 D+ 표시가 변하지 않는다.
- Proposal에 검수 concrete product가 0개면 `검수 완료` 대신 `검수 상품 없음`으로 표시한다.
- Mock 상담 우선순위는 `PoC 규칙 기반`임을 화면에 표시한다.
- 401/403 수신 시 인증 만료 이벤트를 발생시키고 로그인 화면으로 복귀한다.
- 대량 검색 결과가 200건을 초과하면 전체 목록을 sessionStorage에 쓰지 않는다. 저장 실패/생략 상태는 사용자에게 경고한다.
- Mock 추천 근거에 `OPEN` 같은 기술 Enum 대신 한국어 라벨을 사용한다.

## Smoke test

`npm run test:smoke`에서 다음을 추가 검증한다.

- 인증 실패 fail-open 방지
- `status:ERROR` 처리
- 중복 storeId 차단
- 잘못된 날짜 차단
- Proposal product item 검증
- History item 검증
- 저장 실패 응답 처리
- Store status NOT_FOUND 처리
- Product catalog 검증
- 상담 저장 idempotency
- Mock 사용자 문구 Enum 미노출
