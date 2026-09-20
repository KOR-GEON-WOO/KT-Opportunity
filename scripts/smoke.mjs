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
const { addDays } = await import('../src/utils/clock.js');
const { analyzeProductNeeds } = await import('../src/utils/rules.js');
const mockApi = await import('../src/services/mockApi.js');
const contracts = await import('../src/services/contracts.js');

const conditions = createInitialSearchConditions(MOCK_DEMO_TODAY);
assert.equal(conditions.permitDateTo, addDays(MOCK_DEMO_TODAY, -2), 'Mock 기본 조회 종료일은 데모 기준일 D-2여야 합니다.');

const verification = createDefaultVerification();
assert.equal(verification.actualOpenStatus, 'UNKNOWN');
assert.equal(verification.checkedAt, null, '직원 확인 전 checkedAt은 비어 있어야 합니다.');

const analysis = analyzeProductNeeds(verification);
assert.equal(analysis.recommend.length, 0);
assert.equal(analysis.confirm.length, 4);

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
    items: [{ storeId: '1', storeName: 'A', interestProducts: 'INTERNET', updatedAt: '2026-09-18T10:00:00+09:00' }],
  }),
  /interestProducts/,
);
assert.throws(
  () => contracts.normalizeHistoryResponse({ status: 'ERROR', message: 'history failed', items: [] }),
  /history failed/,
);
assert.deepEqual(contracts.normalizeHistoryResponse({ status: 'OK', items: [] }), []);
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

console.log(`smoke ok: ${rows.length} mock restaurants, demo D-2=${conditions.permitDateTo}, idempotency=PASS`);
