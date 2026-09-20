# v6.1 Stability Fixes

이번 수정은 UI 재설계가 아니라 v6 코드 리뷰에서 확인된 실행/상태 문제를 우선 보완한 버전이다.

## 수정 완료

- Dashboard Mock fallback 제거
- Dashboard 지표 실제 session state 계산
- Lead pagination reset/clamp
- store status React state 동기화
- checkedAt의 사전 기록 제거
- LOCALDATA 기본 검색 종료일 D-2
- n8n runtime response validation
- n8n auth/login/logout 연결
- data mode별 auth session 분리
- n8n progress UI의 허위 세부 단계 제거
- proposal validation missing state 표시
- Sidebar/Logout accessible name 보강
- 주요 작은 터치 target 확대
- CSS micro text 일부 상향
- smoke test 추가

## 검증 명령

```bash
npm run test:smoke
npm run build
```

현재 ChatGPT 작업 환경에서는 npm registry cache가 없어 package-lock 생성 및 Vite build는 실행하지 못했다. JS/JSX syntax, CSS parser, local import target, pure JS smoke test는 별도 검증했다.
