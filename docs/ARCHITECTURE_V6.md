# v6 UI/UX Rewrite

## 화면 구조

- Home: 영업 지표와 최근 신규 음식점
- Discovery: 검색 + 후보 목록 + 매장 상세/직원 확인/상품 기회 Master–Detail
- Proposal: 추천 근거, 검수 상품, 상담 스크립트
- Follow-up: 상담 결과/후속 일정 작성 및 저장
- History: append-only 상담 이력
- Products: 검수 완료 상품 기준

## v5 대비 핵심 변경

1. F-01~F-05 Wizard를 사용자 업무 중심 IA로 교체
2. F-02 직원 확인과 F-03 규칙 분석을 한 화면에 통합
3. 직원 확인 기본값을 UNKNOWN으로 변경
4. 자연어 지역 해석 실패 시 기존 지역을 조용히 재사용하지 않음
5. 검색 조건 변경 시 stale 결과를 명시
6. 새 검색 실패 시 기존 결과 유지
7. 상담 이력은 동일 storeId도 append-only
8. Follow-up draft를 sessionStorage에 임시저장
9. 저장 완료 후 readonly summary로 전환
10. KST 날짜를 런타임 계산
11. n8n fetch timeout/AbortController 추가
12. History loading / empty / error 분리
13. 모바일은 Bottom Navigation + Sidebar Drawer 구조
