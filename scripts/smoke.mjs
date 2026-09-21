import assert from 'node:assert/strict';

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
  clear() { this.#data.clear(); }
}

globalThis.window = {
  localStorage: new MemoryStorage(),
  sessionStorage: new MemoryStorage(),
};

const {
  createDefaultVerification,
  createDemoVerification,
  createInitialSearchConditions,
  MOCK_DEMO_TODAY,
} = await import('../src/data/mockData.js');
const { addDays, kstIsoNow } = await import('../src/utils/clock.js');
const { analyzeProductNeeds } = await import('../src/utils/rules.js');
const { validateFollowUp } = await import('../src/utils/validation.js');
const mockApi = await import('../src/services/mockApi.js');
const contracts = await import('../src/services/contracts.js');
const { validateGatewayBaseUrl } = await import('../src/services/gatewayPolicy.js');


// Architecture boundary: browser may call only the authenticated HTTPS n8n Gateway, never Local LLM inference ports/paths.
assert.equal(validateGatewayBaseUrl('https://gateway.example.com').ok, true);
assert.equal(validateGatewayBaseUrl('http://gateway.example.com').code, 'INSECURE_GATEWAY');
assert.equal(validateGatewayBaseUrl('https://gateway.example.com:8000').code, 'DIRECT_INFERENCE_PORT');
assert.equal(validateGatewayBaseUrl('https://gateway.example.com:11434').code, 'DIRECT_INFERENCE_PORT');
assert.equal(validateGatewayBaseUrl('https://gateway.example.com/v1/chat/completions').code, 'DIRECT_INFERENCE_PATH');
assert.equal(validateGatewayBaseUrl('https://user:secret@gateway.example.com').code, 'CREDENTIAL_IN_URL');

const conditions = createInitialSearchConditions(MOCK_DEMO_TODAY);
assert.equal(conditions.permitDateTo, addDays(MOCK_DEMO_TODAY, -2), 'Mock 기본 조회 종료일은 데모 기준일 D-2여야 합니다.');

const verification = createDefaultVerification();
assert.equal(verification.actualOpenStatus, 'UNKNOWN');
assert.equal(verification.checkedAt, null, '직원 확인 전 checkedAt은 비어 있어야 합니다.');

const analysis = analyzeProductNeeds(verification);
assert.equal(analysis.recommend.length, 0);
assert.equal(analysis.confirm.length, 4);

// Immutable opportunity filtering rules (R-06~R-11, R-30)
const closedAnalysis = analyzeProductNeeds({
  ...createDemoVerification(MOCK_DEMO_TODAY),
  actualOpenStatus: 'CLOSED',
});
assert.equal(closedAnalysis.recommend.length, 0, 'CLOSED 매장은 추천 후보가 생기면 안 됩니다.');
assert.equal(closedAnalysis.exclude.length, 4, 'CLOSED 매장은 모든 상품군이 제외되어야 합니다.');

const preparingAnalysis = analyzeProductNeeds({
  ...createDemoVerification(MOCK_DEMO_TODAY),
  actualOpenStatus: 'PREPARING',
  internetStatus: 'UNDECIDED',
  installStatus: 'PASS',
});
assert.equal(preparingAnalysis.eligible, true, 'PREPARING은 영업 기회 확인 대상이어야 합니다.');
assert.ok(preparingAnalysis.recommend.some((item) => item.category === 'INTERNET'), '인터넷은 UNDECIDED + PASS에서만 추천되어야 합니다.');

const internetFail = analyzeProductNeeds({
  ...createDemoVerification(MOCK_DEMO_TODAY),
  actualOpenStatus: 'OPEN',
  internetStatus: 'UNDECIDED',
  installStatus: 'FAIL',
});
assert.ok(internetFail.exclude.some((item) => item.category === 'INTERNET'), 'installStatus=FAIL 인터넷은 추천 제외여야 합니다.');

const contracted = analyzeProductNeeds({
  ...createDemoVerification(MOCK_DEMO_TODAY),
  actualOpenStatus: 'OPEN',
  wifiStatus: 'CONTRACTED',
  posStatus: 'NOT_REQUIRED',
  cctvStatus: 'UNKNOWN',
});
assert.ok(contracted.exclude.some((item) => item.category === 'WIFI'), 'CONTRACTED는 추천 제외여야 합니다.');
assert.ok(contracted.exclude.some((item) => item.category === 'POS'), 'NOT_REQUIRED는 추천 제외여야 합니다.');
assert.ok(contracted.confirm.some((item) => item.category === 'CCTV'), 'UNKNOWN은 추가 확인이어야 합니다.');

const kstStamp = kstIsoNow();
assert.match(kstStamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+09:00$/, '상담 timestamp는 KST ISO 8601 밀리초 형식이어야 합니다.');

await assert.rejects(
  () => mockApi.interpretNaturalSearch({ ...conditions, naturalQuery: '서울 강남구에서 최근 인허가된 일식 음식점' }),
  /지원하지 않는 지역/,
);

const rows = await mockApi.searchRestaurants(conditions);
assert.ok(Array.isArray(rows));
assert.ok(rows.length > 0, '기본 Mock 검색은 최소 1건을 반환해야 합니다.');
assert.equal(contracts.normalizeRestaurantSearchResponse({ status: 'OK', items: rows }).length, rows.length);

assert.throws(
  () => contracts.normalizeAuthResponse({ ok: false, error: 'bad credentials' }),
  /bad credentials/,
  '명시적 인증 실패는 성공으로 보정하면 안 됩니다.',
);
assert.equal(
  contracts.normalizeAuthResponse({ authenticated: true, session: { role: 'KT_SALES' } }).authenticated,
  true,
);

assert.throws(
  () => contracts.normalizeRestaurantSearchResponse({ status: 'ERROR', message: 'upstream failed', items: [] }),
  /upstream failed/,
  'status=ERROR를 0건 성공으로 처리하면 안 됩니다.',
);
assert.throws(
  () => contracts.normalizeRestaurantSearchResponse({ status: 'OK', items: [rows[0], rows[0]] }),
  /중복 storeId/,
);
assert.throws(
  () => contracts.normalizeRestaurantSearchResponse({ status: 'OK', items: [{ ...rows[0], storeId: 'bad-date-row', permitDate: '2026-99-99' }] }),
  /permitDate/,
);

assert.deepEqual(
  contracts.normalizeAnalysisResponse({ status: 'OK', analysis: { recommend: [], confirm: [], exclude: [] } }),
  { recommend: [], confirm: [], exclude: [] },
);
assert.deepEqual(
  contracts.normalizeAnalysisResponse({ status: 'OK', analysis: { recommend: [{ category: 'INTERNET', reason: 'PASS' }], confirm: [], exclude: [] } }).recommend[0],
  { category: 'INTERNET', reason: 'PASS' },
  '허용된 상품 category는 분석 응답에서 유지되어야 합니다.',
);
assert.throws(
  () => contracts.normalizeAnalysisResponse({ status: 'OK', analysis: { recommend: [{ category: 'FAKE', reason: 'x' }], confirm: [], exclude: [] } }),
  /category/,
  '검수되지 않은 상품 category를 분석 응답에서 허용하면 안 됩니다.',
);

assert.throws(
  () => contracts.normalizeProposalResponse({
    status: 'OK',
    proposal: {
      strategy: { summary: 'x', points: [], additionalChecks: [] },
      products: [null],
      script: ['x'],
    },
  }),
  /products/,
);

assert.throws(
  () => contracts.normalizeHistoryResponse({
    status: 'OK',
    items: [{ storeId: '1', storeName: 'A', interestProducts: 'INTERNET', updatedAt: '2026-09-18T10:00:00.000+09:00' }],
  }),
  /interestProducts/,
);
assert.throws(
  () => contracts.normalizeHistoryResponse({ status: 'ERROR', message: 'history failed', items: [] }),
  /history failed/,
);
assert.deepEqual(contracts.normalizeHistoryResponse({ status: 'OK', items: [] }), []);

assert.throws(
  () => contracts.normalizeHistoryResponse({
    status: 'OK',
    items: [{
      storeId: 'kst-1', storeName: 'KST 검증', interestProducts: ['INTERNET'],
      leadStatus: 'FOLLOW_UP', consultationStatus: 'COMPLETED',
      updatedAt: '2026-09-18T10:00:00Z',
    }],
  }),
  /KST ISO 8601 밀리초/,
  '상담 이력 updatedAt은 UTC/Z 또는 offset 없는 timestamp를 허용하면 안 됩니다.',
);
assert.throws(
  () => contracts.normalizeHistoryResponse({
    status: 'OK',
    items: [{
      storeId: 'kst-2', storeName: '밀리초 검증', interestProducts: ['INTERNET'],
      leadStatus: 'FOLLOW_UP', consultationStatus: 'COMPLETED',
      updatedAt: '2026-09-18T10:00:00+09:00',
    }],
  }),
  /KST ISO 8601 밀리초/,
  '상담 이력 updatedAt에서 밀리초를 생략하면 안 됩니다.',
);
assert.equal(
  contracts.normalizeHistoryResponse({
    status: 'OK',
    items: [{
      storeId: 'kst-3', storeName: '정상 KST', interestProducts: ['INTERNET'],
      leadStatus: 'FOLLOW_UP', consultationStatus: 'COMPLETED',
      updatedAt: '2026-09-18T10:00:00.123+09:00',
      approvedAt: '2026-09-18T09:59:59.999+09:00',
    }],
  })[0].storeId,
  'kst-3',
  '정확한 KST ISO 8601 밀리초 timestamp는 허용해야 합니다.',
);

assert.throws(
  () => contracts.normalizeHistoryResponse({
    status: 'OK',
    items: [{
      storeId: 'kst-invalid-day', storeName: '달력 날짜 검증', interestProducts: ['INTERNET'],
      leadStatus: 'FOLLOW_UP', consultationStatus: 'COMPLETED',
      updatedAt: '2026-02-31T10:00:00.123+09:00',
    }],
  }),
  /KST ISO 8601 밀리초/,
  '형식이 맞아도 실제 달력에 존재하지 않는 KST 날짜는 거부해야 합니다.',
);
assert.throws(
  () => contracts.normalizeHistoryResponse({
    status: 'OK',
    items: [{
      storeId: 'kst-invalid-hour', storeName: '시간 범위 검증', interestProducts: ['INTERNET'],
      leadStatus: 'FOLLOW_UP', consultationStatus: 'COMPLETED',
      updatedAt: '2026-09-18T24:00:00.000+09:00',
    }],
  }),
  /KST ISO 8601 밀리초/,
  '24:00처럼 다음 날로 정규화될 수 있는 시각은 엄격한 KST 계약에서 거부해야 합니다.',
);

assert.equal(contracts.normalizeStoreStatusResponse({ status: 'NOT_FOUND' }), null);

assert.throws(
  () => contracts.normalizeSaveResponse({ status: 'OK', result: { ok: false, error: 'db failed' } }),
  /db failed/,
);
assert.equal(contracts.normalizeSaveResponse({ status: 'OK', result: { ok: true, savedAt: 'x' } }).ok, true);

const catalog = await mockApi.fetchProductCatalog();
assert.equal(contracts.normalizeProductCatalogResponse({ status: 'OK', items: catalog }).length, catalog.length);

const demoVerification = createDemoVerification(MOCK_DEMO_TODAY);
const demoAnalysis = await mockApi.runRuleAnalysis(demoVerification);
const proposal = await mockApi.generateProposal(rows[0], demoVerification, demoAnalysis);
assert.ok(proposal.strategy.points[0].includes('개업'));
const catalogCodes = new Set(catalog.map((item) => item.productCode));
assert.ok(proposal.products.every((item) => catalogCodes.has(item.productCode)), 'Proposal은 검수 catalog에 없는 productCode를 생성하면 안 됩니다.');
assert.ok(!proposal.strategy.points[0].includes('OPEN'), '사용자 문구에 기술 Enum을 노출하면 안 됩니다.');

const consultationId = 'smoke-consultation-1';
const followUpPayload = {
  consultationId,
  proposalVersion: proposal.generatedAt,
  storeId: rows[0].storeId,
  storeName: rows[0].storeName,
  roadAddress: rows[0].roadAddress,
  leadStatus: 'FOLLOW_UP',
  recommendedProductCodes: proposal.products.map((item) => item.productCode),
  consultationStatus: 'COMPLETED',
  consultationResult: 'FOLLOW_UP',
  interestProducts: ['INTERNET'],
  followUpDate: '2026-09-25',
  notes: 'smoke',
  saveApproved: true,
  approvedAt: '2026-09-18T10:00:00.000+09:00',
  updatedAt: '2026-09-18T10:00:00.000+09:00',
};
await assert.rejects(() => mockApi.saveFollowUp({ ...followUpPayload, saveApproved: false }), /최종 저장 승인/, 'saveApproved=true가 아니면 최초 저장하면 안 됩니다.');


const approvedCatalog = await mockApi.fetchProductCatalog();
const catalogCheckedProposal = contracts.assertProposalCatalogSubset(proposal, approvedCatalog);
assert.equal(catalogCheckedProposal, proposal, '검수 catalog subset을 만족하는 proposal은 유지되어야 합니다.');
assert.throws(
  () => contracts.assertProposalCatalogSubset({ ...proposal, products: [{ ...proposal.products[0], productCode: 'FAKE-PRODUCT' }] }, approvedCatalog),
  /catalog에 없는 productCode/,
  'F-04 결과가 검수 catalog에 없는 상품을 생성하면 trust boundary에서 거부해야 합니다.',
);
assert.throws(
  () => contracts.assertProposalCatalogSubset({ ...proposal, products: [{ ...proposal.products[0], productName: '임의 변경 상품명' }] }, approvedCatalog),
  /productName이 catalog와 일치하지 않습니다/,
  'F-04가 검수 상품 메타데이터를 변조하면 거부해야 합니다.',
);
contracts.validateSaveRequest(followUpPayload);
assert.throws(
  () => contracts.validateSaveRequest({ ...followUpPayload, updatedAt: '2026-09-18T10:00:00Z' }),
  /KST ISO 8601 밀리초/,
  'F-05 outbound 저장 요청도 KST millisecond 계약을 강제해야 합니다.',
);
assert.throws(
  () => contracts.validateSaveRequest({ ...followUpPayload, saveApproved: false }),
  /saveApproved=true/,
  'F-05 outbound boundary에서 최초 저장 승인 gate를 우회할 수 없어야 합니다.',
);

await mockApi.saveFollowUp(followUpPayload);
await mockApi.saveFollowUp({ ...followUpPayload, updatedAt: '2026-09-18T10:01:00.000+09:00' });
const history = await mockApi.fetchHistory();
assert.equal(history.filter((item) => item.consultationId === consultationId).length, 1, '동일 consultationId 재시도는 중복 append하면 안 됩니다.');

assert.throws(
  () => contracts.normalizeInterpretResponse({ status: 'OK' }, conditions),
  /지역 정보가 없습니다/,
  '서버 해석 응답이 비어 있을 때 기존 지역을 재사용하면 안 됩니다.',
);
assert.throws(
  () => contracts.normalizeRestaurantSearchResponse({ status: 'OK' }),
  /items 배열/,
);

const { readFile } = await import('node:fs/promises');
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(packageJson.version, '2.4.0', 'package 버전은 V2.4 FINAL와 동기화되어야 합니다.');

const providerSource = await readFile(new URL('../src/app/AgentProvider.jsx', import.meta.url), 'utf8');
assert.match(providerSource, /const searchInFlight = useRef\(false\)/, '검색은 전용 in-flight lock을 사용해야 합니다.');
assert.doesNotMatch(providerSource, /async function search\(\)[\s\S]*?proposalInFlight\.current = true[\s\S]*?function selectStore/, '검색이 F-04 proposal lock을 점유하면 안 됩니다.');
assert.match(providerSource, /saveInFlight\.current\.has\(form\.consultationId\)/, '동일 consultationId의 동시 저장을 클라이언트에서 차단해야 합니다.');


const workflowTrailSource = await readFile(new URL('../src/components/layout/WorkflowTrail.jsx', import.meta.url), 'utf8');
assert.match(workflowTrailSource, /aria-current=\{current \? 'step'/, '현재 workflow 단계는 aria-current=step으로 노출해야 합니다.');
assert.match(workflowTrailSource, /탐색 · 확인[\s\S]*맞춤 제안[\s\S]*후속 상담[\s\S]*이력 확인/, '업무 trail은 영업 흐름 순서를 유지해야 합니다.');
assert.match(workflowTrailSource, /proposal: Boolean\(proposal\)/, '제안 완료 상태는 실제 proposal 데이터가 있을 때만 표현해야 합니다.');
assert.match(workflowTrailSource, /followup: Boolean\(saveResult\)/, '후속 상담 완료 상태는 실제 saveResult가 있을 때만 표현해야 합니다.');
assert.match(workflowTrailSource, /proposal: Boolean\(selectedStore && proposal\)/, '생성되지 않은 Proposal 단계로 직접 이동하게 하면 안 됩니다.');
assert.doesNotMatch(workflowTrailSource, /index < currentIndex/, '화면 순서만으로 이전 단계를 완료 처리하면 안 됩니다.');
const followUpSource = await readFile(new URL('../src/features/followup/FollowUp.jsx', import.meta.url), 'utf8');
assert.match(followUpSource, /save-gate-status[\s\S]*role="status"[\s\S]*aria-live="polite"/, '최초 저장 gate 상태는 보조기술에 전달되어야 합니다.');


const operationalNoticeSource = await readFile(new URL('../src/components/ui/OperationalNotice.jsx', import.meta.url), 'utf8');
assert.match(operationalNoticeSource, /catalog[\s\S]*검수 상품 정보가 일치하지 않습니다/, 'catalog trust-boundary 실패는 사용자 복구 안내로 변환해야 합니다.');
assert.match(operationalNoticeSource, /KST ISO 8601[\s\S]*상담 기록 시간 형식을 확인할 수 없습니다/, 'KST 저장 계약 실패는 시간 형식 복구 안내를 제공해야 합니다.');
const proposalSource = await readFile(new URL('../src/features/proposal/Proposal.jsx', import.meta.url), 'utf8');
assert.match(proposalSource, /OperationalNotice message=\{error\}[\s\S]*생성된 맞춤 제안이 없습니다/, 'Proposal 생성 전 실패도 EmptyState에서 숨기면 안 됩니다.');
const appMetaSource = await readFile(new URL('../src/config/appMeta.js', import.meta.url), 'utf8');
assert.match(appMetaSource, /APP_VERSION = 'V2.4 FINAL'/, 'UI 버전은 V2.4 FINAL여야 합니다.');
assert.match(appMetaSource, /APP_RELEASE_STATUS = 'Release'/, 'V2.4 FINAL는 완료된 release baseline이어야 합니다.');

console.log(`smoke ok: V2.4 FINAL Release, ${rows.length} mock restaurants, demo D-2=${conditions.permitDateTo}, rules=PASS, idempotency=PASS`);
