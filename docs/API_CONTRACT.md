# 신규 음식점 영업 Agent — Frontend / n8n 계약 초안

## 원칙

- React 브라우저는 행정안전부 OpenAPI와 Local LLM inference port를 직접 호출하지 않는다.
- OpenAPI credential과 Gateway token은 n8n Credential에서 관리한다.
- F-01 검색은 `regionLevel1`, `regionLevel2`, `permitDateFrom`, `permitDateTo`가 필수다.
- 기본 `businessStatus`는 `영업/정상`이며 인허가일 최신순으로 반환한다.
- OpenAPI 다중 페이지는 n8n이 모두 조회하고 총 수집 건수를 검증한다.
- 조회 0건과 API 실패는 서로 다른 응답 상태로 반환한다.

## Restaurant normalized schema

핵심 필드:
`storeName`, `roadAddress`, `lotAddress`, `permitDate`, `businessStatus`,
`businessStatusCode`, `detailedBusinessStatus`, `detailedBusinessStatusCode`,
`localGovernmentCode`, `storeId`, `area`, `facilitySize`, `businessType`,
`multiUseBusinessYn`, `phone`, `coordinateX`, `coordinateY`, `dataUpdatedAt`,
`lastModifiedAt`.

프런트 Mock 데이터는 이 스키마를 그대로 사용한다.

## n8n Webhook contract placeholder

- `POST /webhook/auth/login`
- `POST /webhook/auth/logout`
- `POST /webhook/restaurant/interpret`
- `POST /webhook/restaurant/search`
- `POST /webhook/restaurant/verify`
- `POST /webhook/restaurant/analyze`
- `POST /webhook/restaurant/proposal`
- `POST /webhook/restaurant/follow-up`
- `GET  /webhook/restaurant/history`

Webhook 이름은 n8n 구현 시 변경할 수 있으며 `src/services/n8nApi.js`만 수정하면 된다.
