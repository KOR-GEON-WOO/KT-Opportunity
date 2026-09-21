# 신규 음식점 영업 Agent — Frontend / n8n 계약

## 원칙

- React 브라우저는 행정안전부 OpenAPI와 Local LLM inference port를 직접 호출하지 않는다.
- OpenAPI credential과 Gateway token은 n8n Credential 또는 서버 Gateway에서 관리한다.
- F-01 검색은 `regionLevel1`, `regionLevel2`, `permitDateFrom`, `permitDateTo`가 필수다.
- 기본 `businessStatus`는 `영업/정상`이며 인허가일 최신순으로 반환한다.
- OpenAPI 다중 페이지는 n8n이 모두 조회하고 총 수집 건수를 검증한다.
- 조회 0건은 성공 응답의 빈 `items` 배열이며 API 실패와 구분한다.
- 브라우저는 모든 n8n 응답을 runtime schema로 재검증한다.
- `status: ERROR`, `ok: false`, `success: false`는 HTTP 200이어도 실패로 처리한다.
- 401/403은 인증 만료로 간주하고 브라우저 세션을 종료한다.

## Restaurant normalized schema

핵심 필드:
`storeName`, `roadAddress`, `lotAddress`, `permitDate`, `businessStatus`,
`businessStatusCode`, `detailedBusinessStatus`, `detailedBusinessStatusCode`,
`localGovernmentCode`, `storeId`, `area`, `facilitySize`, `businessType`,
`multiUseBusinessYn`, `phone`, `coordinateX`, `coordinateY`, `dataUpdatedAt`,
`lastModifiedAt`.

프런트 Mock 데이터는 이 스키마를 그대로 사용한다.

각 검색 결과는 최소 `storeId`, `storeName`, `permitDate`를 가져야 하며 `storeId`는 응답 내에서 유일해야 한다. `permitDate`는 `YYYY-MM-DD` 형식의 유효한 날짜여야 한다.

검색 응답에 기존 직원 확인 상태를 포함할 수 있다.

```json
{
  "storeId": "4490000-101-2026-00331",
  "storeName": "성정동 오늘초밥",
  "permitDate": "2026-09-16",
  "verification": {
    "actualOpenStatus": "OPEN",
    "installStatus": "PASS",
    "internetStatus": "UNDECIDED",
    "wifiStatus": "UNDECIDED",
    "posStatus": "CONTRACTED",
    "cctvStatus": "UNKNOWN",
    "checkedAt": "2026-09-18"
  }
}
```

## Webhook endpoints

- `POST /webhook/auth/login`
- `POST /webhook/auth/logout`
- `POST /webhook/restaurant/interpret`
- `POST /webhook/restaurant/search`
- `POST /webhook/restaurant/status`
- `POST /webhook/restaurant/verify`
- `POST /webhook/restaurant/analyze`
- `POST /webhook/restaurant/proposal`
- `POST /webhook/restaurant/follow-up`
- `GET  /webhook/restaurant/history`
- `GET  /webhook/restaurant/products`

Webhook 이름은 n8n 구현 시 변경할 수 있으며 `src/services/n8nApi.js`에서 수정한다.

## 공통 성공/실패 규칙

성공 응답은 최소 하나의 명시적 성공 신호를 사용하는 것을 권장한다.

```json
{ "status": "OK" }
```

또는:

```json
{ "ok": true }
```

실패는 HTTP status를 적절히 사용하고, JSON body에도 명시한다.

```json
{
  "status": "ERROR",
  "error": "upstream LOCALDATA request failed"
}
```

프런트는 HTTP 200이라도 `status: ERROR`, `ok: false`, `success: false`를 정상 응답으로 처리하지 않는다.

## 권장 응답 형식

### Login

```json
{
  "authenticated": true,
  "session": {
    "role": "KT_SALES",
    "loggedInAt": "2026-09-18T09:30:00+09:00"
  }
}
```

로그인 성공은 `authenticated: true`, `ok: true`, `success: true`, `status: OK` 중 하나를 명시해야 한다. `authenticated: false`, `ok: false`는 인증 실패다. 실제 세션 토큰은 JSON이 아니라 HttpOnly Cookie 또는 Cloudflare Access 세션으로 관리한다.

### Interpret

```json
{
  "status": "OK",
  "conditions": {
    "regionLevel1": "충청남도",
    "regionLevel2": "천안시",
    "permitDateFrom": "2026-08-17",
    "permitDateTo": "2026-09-16",
    "businessStatus": "영업/정상",
    "businessType": "일식",
    "storeNameKeyword": ""
  }
}
```

### Restaurant search

```json
{
  "status": "OK",
  "totalCollected": 74,
  "items": []
}
```

`items`는 항상 배열이다. 0건일 때도 `items: []`를 반환한다.

### Store status restore

새 브라우저 세션에서 이전 직원 확인 결과를 복원하기 위한 endpoint다.

Request:

```json
{
  "storeId": "4490000-101-2026-00331"
}
```

Response:

```json
{
  "status": "OK",
  "verification": {
    "actualOpenStatus": "OPEN",
    "installStatus": "PASS",
    "internetStatus": "UNDECIDED",
    "wifiStatus": "UNDECIDED",
    "posStatus": "CONTRACTED",
    "cctvStatus": "UNKNOWN",
    "checkedAt": "2026-09-18",
    "checkNote": "CCTV 사용 여부 추가 확인"
  }
}
```

저장된 상태가 없으면 HTTP 200으로 다음처럼 반환할 수 있다.

```json
{ "status": "NOT_FOUND" }
```

### Verification save

```json
{
  "status": "OK",
  "verification": {
    "actualOpenStatus": "OPEN",
    "installStatus": "PASS",
    "internetStatus": "UNDECIDED",
    "wifiStatus": "UNDECIDED",
    "posStatus": "CONTRACTED",
    "cctvStatus": "UNKNOWN",
    "checkedAt": "2026-09-18",
    "checkNote": "CCTV 사용 여부 추가 확인"
  }
}
```

서버가 Enum 정규화, `checkedAt`, 메모 trim 등을 보정했다면 보정된 `verification`을 반환한다. 프런트는 이 서버 반환값을 실제 UI state에 반영한다.

### Rule analysis

```json
{
  "status": "OK",
  "analysis": {
    "recommend": [],
    "confirm": [],
    "exclude": []
  }
}
```

세 배열은 모두 필수다. 각 항목은 `category`와 비어 있지 않은 `reason`을 포함한다.

### Proposal

```json
{
  "status": "OK",
  "proposal": {
    "strategy": {
      "priority": "HIGH",
      "summary": "...",
      "points": [],
      "additionalChecks": []
    },
    "products": [],
    "catalogMissing": [],
    "script": ["..."],
    "generatedAt": "2026-09-18T09:30:00.000+09:00",
    "modelFlow": [],
    "validation": {
      "schema": "PASS",
      "productCodes": "PASS"
    }
  }
}
```

`products`의 각 항목은 최소 `productCode`, `productCategory`, `productName`을 가져야 한다. `validation`이 누락되면 프런트는 PASS로 추정하지 않고 `미수신`으로 표시한다.

### Product catalog

```json
{
  "status": "OK",
  "items": [
    {
      "productCode": "KT_NET_01",
      "productCategory": "INTERNET",
      "productName": "KT 기업인터넷",
      "monthlyFee": 55000,
      "eligibilityCondition": "사업자 고객 대상",
      "benefit": "검수된 혜택 내용",
      "validFrom": "2026-09-01",
      "validTo": "2026-09-30",
      "verifiedAt": "2026-09-18"
    }
  ]
}
```

n8n 모드에서는 상품 기준 화면과 Proposal 생성이 동일한 서버 catalog를 source of truth로 사용해야 한다.

### Follow-up save

Request에는 재시도 중복 저장 방지를 위한 `consultationId`가 필수다.

```json
{
  "consultationId": "018f8e8d-...",
  "proposalVersion": "2026-09-18T09:30:00.000+09:00",
  "storeId": "4490000-101-2026-00331",
  "saveApproved": true,
  "updatedAt": "2026-09-18T09:40:00.000+09:00"
}
```

Response:

```json
{
  "status": "OK",
  "result": {
    "ok": true,
    "consultationId": "018f8e8d-...",
    "savedAt": "2026-09-18T09:40:00.000+09:00"
  }
}
```

n8n/Google Sheets 저장 로직은 동일 `consultationId` 요청을 여러 번 받아도 상담 이력을 한 번만 append해야 한다. 네트워크 timeout 후 사용자가 재시도해도 같은 `consultationId`가 전달된다.

### History

```json
{
  "status": "OK",
  "items": []
}
```

각 이력은 `storeId`, `storeName`, `interestProducts` 배열, 유효한 `updatedAt`을 포함해야 한다. 동일 `storeId`의 상담도 건별로 누적하되 동일 `consultationId`는 중복 저장하지 않는다.
