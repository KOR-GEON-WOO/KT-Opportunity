# v6 UI/UX QA 기준

- 1440px 이상: Sidebar + Master/Detail 유지
- 1120px: 제안/후속관리 1열 재배치
- 920px 이하: Sidebar drawer + Bottom navigation
- 720px 이하: 검색 2열, 분석 1열
- 520px 이하: 폼 1열, 입력 16px, CTA full width
- 320px: page-level horizontal scroll 없이 사용 가능해야 함

## 상태 QA

- 검색 조건 변경 시 이전 결과를 stale로 표시
- 새 검색 실패 시 기존 결과 유지
- 직원 확인 기본값 UNKNOWN
- 동일 storeId 상담 여러 건 append
- Follow-up 작성 중 이동 후 Draft 복원
- 저장 후 Readonly summary 표시
- History loading / empty / error 분리
- n8n 요청 timeout 처리
