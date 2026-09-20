# 신규 음식점 영업 Agent — Frontend / n8n 계약

## 원칙

- React 브라우저는 행정안전부 OpenAPI와 Local LLM inference port를 직접 호출하지 않는다.
- OpenAPI credential과 Gateway token은 n8n Credential 또는 서버 Gateway에서 관리한다.
- F-01 검색은 `regionLevel1`, `regionLevel2`, `permitDateFrom`, `permitDateTo`가 필수다.
- 기본 `businessStatus`는 `영업/정상`이며 인허가일 최신순으로 반환한다.
- OpenAPI 다중 페이지는 n8n이 모두 조회하고 총 수집 건수를 검증한다.
- 조회 0건은 성공 응답의 빈 `items` 배열이며 API 실패와 구분한다.
- 브라우저는 모든 n8n 응답을 runtime schema로 재검증한다.

## Restaurant normalized schema

핵심 필드:
`storeName`, `roadAddress`, `lotAddress`, `permitDate`, `businessStatus`,
`businessStatusCode`, `detailedBusinessStatus`, `detailedBusinessStatusCode`,
`localGovernmentCode`, `storeId`, `area`, `facilitySize`, `businessType`,
`multiUseBusinessYn`, `phone`, `coordinateX`, `coordinateY`, `dataUpdatedAt`,
`lastModifiedAt`.

프런트 Mock 데이터는 이 스키마를 그대로 사용한다.

## Webhook endpoints

- `POST /webhook/auth/login`
- `POST /webhook/auth/logout`
- `POST /webhook/restaurant/interpret`
- `POST /webhook/restaurant/search`
- `POST /webhook/restaurant/verify`
- `POST /webhook/restaurant/analyze`
- `POST /webhook/restaurant/proposal`
- `POST /webhook/restaurant/follow-up`
- `GET  /webhook/restaurant/history`

Webhook 이름은 n8n 구현 시 변경할 수 있으며 `src/services/n8nApi.js`에서 수정한다.

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

프런트는 `authenticated: false`를 인증 실패로 처리한다. 실제 세션 토큰은 JSON이 아니라 HttpOnly Cookie 또는 Cloudflare Access 세션으로 관리한다.

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

`items`는 항상 배열이다. 0건일 때도 `items: []`를 반환한다. 각 항목에는 최소 `storeId`, `storeName`, `permitDate`가 있어야 한다.

### Verification

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

세 배열은 모두 필수다.

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
    "script": [],
    "generatedAt": "2026-09-18T09:30:00.000+09:00",
    "modelFlow": [],
    "validation": {
      "schema": "PASS",
      "productCodes": "PASS"
    }
  }
}
```

`validation`이 누락되면 프런트는 PASS로 추정하지 않고 `미수신`으로 표시한다.

### Follow-up save

```json
{
  "status": "OK",
  "result": {
    "ok": true,
    "savedAt": "2026-09-18T09:30:00.000+09:00"
  }
}
```

### History

```json
{
  "status": "OK",
  "items": []
}
```

동일 `storeId`의 상담도 건별로 append하고 이전 이력을 덮어쓰지 않는다.
