# KT Opportunity

행정안전부 일반음식점 인허가 데이터를 기반으로 최근 개업 음식점을 찾고, 직원 확인 정보와 규칙 기반 상품 판별을 거쳐 검수된 KT 상품 범위에서 상담안을 만드는 React/Vite PoC입니다.

## 기능 흐름

1. **F-01 신규 음식점 후보 발굴** — 지역/기간/업태/사업장명 조건, 자연어 검색, LOCALDATA `/info` 스키마
2. **F-02 영업 가능 매장 확인** — 실제 개업, 인터넷 설치 가능, 인터넷/Wi-Fi/POS/CCTV 계약 상태
3. **F-03 매장별 필요 상품 분석** — JavaScript deterministic rule engine
4. **F-04 맞춤 상품 조합 및 상담안 생성** — HyperCLOVA X 분석 → 모델 전환 → KT Mi:dm 상담 문구
5. **F-05 상담 결과 및 후속관리** — leadStatus, consultationStatus, 관심상품, 후속일, 직원 승인 저장

## 실행

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## 현재 데이터 모드

기본값은 `mock`이며, 행정안전부 일반음식점 OpenAPI 원천 필드와 동일한 형태의 PoC 데이터를 사용합니다. 실제 연동 시 `.env.production`에서 `VITE_DATA_MODE=n8n`으로 바꾸고 n8n HTTPS Gateway를 지정합니다. 브라우저에는 OpenAPI Key나 Local LLM 인증 토큰을 저장하지 않습니다.

자세한 백엔드 계약 초안은 `docs/API_CONTRACT.md`, 배포 절차는 `deploy/README.md`를 참고하세요.
