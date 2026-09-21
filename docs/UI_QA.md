# KT Opportunity — UI/UX QA 기준

- 1800px 이상: Sidebar + 420px Master + Detail, content max-width 1720px
- 1480px 이하: Master 폭 축소, Opportunity 분석 패널 하단 이동
- 1180px 이하: 제안/후속관리 1열, 검색 조건 2열
- 960px 이하: Sidebar drawer + Bottom navigation, Master/Detail 1열
- 760px 이하: 검색 2열, 분석 1열, 제안 카드 1열
- 540px 이하: 폼 1열, 입력 16px, CTA full width
- 320px: page-level horizontal scroll 없이 사용 가능해야 함

## 타이포그래피 QA

- 일반 본문이 13px 미만으로 내려가지 않도록 확인
- 핵심 목록/폼 입력은 13~15px 범위 유지
- 모바일 입력은 16px 유지
- 한국어 제목/설명에 한두 글자만 단독 줄로 남는 현상을 최소화
- 긴 주소·관리번호·상품 코드는 필요한 위치에서만 wrap/ellipsis 처리

## 상태 QA

- 검색 조건 변경 시 이전 결과를 stale로 표시
- 새 검색 실패 시 기존 결과 유지
- 직원 확인 기본값 UNKNOWN
- 동일 storeId 상담 여러 건 append
- Follow-up 작성 중 이동 후 Draft 복원
- 저장 후 Readonly summary 표시
- History loading / empty / error 분리
- n8n 요청 timeout 처리
