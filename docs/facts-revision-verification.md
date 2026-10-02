# B Fact 보완·제안 수정 구현 및 검증

2026-10-03 KST. 기존 A 커밋 `06262ca`에서 로컬 `feat/b-facts-revision`을 만들었다. 작업 시작 clean. 외부 자료의 00 B, 01/02/03 공통 기준, C-FACTS/C-PROPOSAL/C-REVIEW, UX-06/09, 관련 P08/P11과 최소 P09/P10을 적용했다. 상세설계서 V2.1과 구현·연결 보고서, 로컬 통합 export의 F02 입력/summary와 F05 최종 응답을 대조했다. 실연동 시험이 아니다.

## 작동하는 경로

1. 데모 검색 → 매장 선택 → 매장 사실 보완. 지원 9개 필드의 변경 전후를 확인하고 변경분만 반영한다. 수량 0·소수, boolean true/false/UNKNOWN, 통신사 문자열/UNKNOWN을 구분한다. 빈 값은 UNKNOWN이나 0으로 변환하지 않는다.
2. 독립 Fact 보완은 `facts` 요청 하나다. 데모 응답에서 기존 facts·evidence를 유지하고 HUMAN 근거를 추가한다. 상호·주소·일치 상태는 편집하지 않는다. 기존 제안은 그대로 둔다.
3. 기존 제안의 표현 수정은 `review` REVISE와 사유만 보낸다. 새 사실 수정도 같은 `review` 요청 하나에 non-empty dirty facts만 포함한다. `facts`를 선행 호출하지 않는다. 인증되지 않은 브라우저 actor와 임의 draftId/version/revisionType/lock 필드를 추가하지 않는다.
4. 새 `resultProposalId/newProposal`, 매장/parent 연결, PENDING_REVIEW, 저장 여부·본문을 확인한 뒤 이전 제안만 SUPERSEDED로 바꾼다. 이전 본문과 연결을 보존하며 세션 선택기에서 읽는다. 초안 매장 수는 버전 수로 부풀리지 않는다.
5. HTTP 200 무초안, 잘못된 연결, 상태 충돌, 미존재 ID, 응답 단절은 원본·입력을 유지한다. 불명확한 결과는 대상 재전송을 잠그고 실제 read API 미연결을 안내한다. 자동 POST 재시도는 없다. UI 잠금은 서버 멱등성 보장이 아니다.
6. F05 응답에는 최신 Entity 전체가 보장되지 않는다. FACTS 수정 후 기존 매장 정보를 임의로 최신값으로 갱신하지 않는다. 새 제안에 이번 요청 Fact를 별도 표시하고 추가 Fact 편집을 잠근다. noDraft/timeout의 실제 Entity 반영 여부도 미확인이다. 데모 초기화는 새 검색으로만 한다.

제안 조회는 기회 요약·Need/유효 근거 참조·선택 상품 이유·제공된 Variant 요금·전략·포인트·상담안을 plain text로 표시한다. 0원과 결측 요금은 구분한다. 제공되지 않은 상세는 미제공으로 안내한다. reentryContext·원문 내부 객체는 클라이언트 수정 원본으로 노출하지 않는다. 전체 상품 판정/승인/반려/상담 기능은 B의 구현 범위가 아니다.

## 변경 파일

| 파일 | 변경 |
|---|---|
| src/domain/mutations.js | dirty Fact, 요청/응답 검증, 대상에 한정된 상태 적용 |
| src/services/mutationService.js | 합성 변경 transport, 성공/무초안/오류/충돌/미존재/불완전/단절 fixture |
| src/features/entities/FactFields.jsx | 9개 Fact 편집·형식 검사·전후 비교 |
| src/features/proposals/MutationDialog.jsx | 수정 방식·사유·상태·재전송 제한·modal focus·테마 |
| src/features/proposals/ProposalPanel.jsx | 최소 제안 조회·버전 선택·요청 Fact 출처 표시 |
| src/domain/adapter.js | 공통 Entity/Proposal projection, 선택 응답 필드 |
| src/App.jsx / features/entities/EntityDetail.jsx | 세션 반영, 대상을 캡처한 편집, HUMAN 근거·시점 안내 |
| src/components/ThemeControl.jsx | 여러 테마 창의 label/radio ID 충돌 방지 |
| src/App.css / src/index.css | 양 테마 편집·본문·모바일·확대 레이아웃 |
| tests/mutations.test.js / tests/browser/mutations.spec.js | B 계약·실패·회귀·브라우저 검증 |
| README.md / 이 문서 | 실행·범위·인계 |

외부 MD01/03도 갱신했다. 외부 자료·MD 팩·n8n export·실제 응답·테스트 결과는 저장소에 추가하지 않았다.

## 실행과 데모 확인

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm test
npm run lint
npm run build
npm run test:e2e
```

빌드 미리보기: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`. 현재 4173의 기존 Vite preview 서버를 재사용해 최신 빌드를 확인했다. 열려 있는 페이지는 새 빌드 뒤 새로고침한다.

## 결과와 계층

| 검증 | 실제 결과 |
|---|---|
| L1 단위 | 21 PASS: 기존 A 11 + B 10. AT-12/13/22~25 관련 요청·연결·오류·중복 억제 |
| L3 Chrome 전체 회귀 | 37 PASS: A 23 + B 14, 38.5초 |
| 시각 수정 뒤 B 재검증 | 14 PASS, 18.2초. 확대 시 선택 문구 단축·Fact grid 개선·비활성 버튼의 초점 복귀 보완 |
| lint / build | PASS / PASS, JS 279.29 kB (gzip 86.46), CSS 17.27 kB (gzip 4.32) |
| 반응형·테마 | A 전체 경로 양 테마 360/390/768/1024/1440px; B 편집 양 테마 390/1440px, root 글자 200% |
| 입력·접근성 | theme 중 입력/선택 유지, nested dialog Escape, Tab trap/복귀, cancel 호출 없음, 44px 공통 control, 가로 넘침 없음 |
| 보안/출처 경계 | untrusted text 실행 없음, LIVE/RECORDED 쓰기 거절, 내부 reentryContext 제외, 외부 요청 0 (합성 시나리오) |
| 빌드 화면 | Codex 내장 브라우저 4173: 검색 3개 → 표현 수정 → 새 PENDING_REVIEW/이전 SUPERSEDED 연결; 관측 console error/warn 0 |
| L2 실제 backend | NOT TESTED: n8n·Sheets·HCX/Mapping/Mi:dm·직원 인증·실제 저장/재진입·다중 Sheet 일관성 |
| 기타 미검증 | Safari/Firefox, 실물 모바일/가상 키보드/VoiceOver, 브라우저 메뉴 zoom, 성능 프로파일 |

외부 증거: `../work/web-b-20261003/verification-summary.json`, `browser-before-label-fix/`(전체 37), `browser-final-b/`(보완 후 B 14), `source-sha256.json`. 스크린샷의 글자 확대는 root font-size 200%이며 브라우저 메뉴 zoom 시험으로 주장하지 않는다.

## 남은 연동

GAP-01 wire/auth/HTTP capture, GAP-02 최신 Entity·제안 read, GAP-03 서버 확인 직원 신원, GAP-04 상품 판정 상세, GAP-05 무결성·멱등성/동시성, GAP-06 동기 timeout, GAP-07 AI schema 확인이 필요하다. 운영 backend의 재평가·저장 동작은 fixture 통과로 입증되지 않는다.

B는 2026-10-03 사용자의 커밋 요청에 따라 `feat/b-facts-revision`의 `713f91e`로 정리했다. 커밋 전 최종 검증 대상 소스·테스트 22개 파일의 해시가 검증 기록과 동일함을 확인했다.

이후 사용자가 GitHub 동기화를 요청해 B 작업 브랜치 Push·PR·미리보기 공유를 허용했다. A PR #1이 아직 열려 있으므로 B PR의 비교 기준은 `feat/a-demo-workspace`로 두어 B 추가 변경을 검토한다. B 브랜치에는 A와 B 구현이 모두 포함된다. 배포 성공·URL·온라인 확인 결과는 B PR에 기록한다. 운영 main 직접 Push·PR 병합·Cloudflare 설정 변경·실제 n8n/Sheets 쓰기는 범위 밖이다.
