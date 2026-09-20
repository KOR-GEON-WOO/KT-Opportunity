import assert from 'node:assert/strict';
import { createDefaultVerification, createInitialSearchConditions } from '../src/data/mockData.js';
import { addDays, getKstToday } from '../src/utils/clock.js';
import { analyzeProductNeeds } from '../src/utils/rules.js';
import { interpretNaturalSearch, searchRestaurants } from '../src/services/mockApi.js';
import {
  normalizeAnalysisResponse,
  normalizeHistoryResponse,
  normalizeInterpretResponse,
  normalizeProposalResponse,
  normalizeRestaurantSearchResponse,
} from '../src/services/contracts.js';

const conditions = createInitialSearchConditions();
assert.equal(conditions.permitDateTo, addDays(getKstToday(), -2), '기본 조회 종료일은 KST D-2여야 합니다.');

const verification = createDefaultVerification();
assert.equal(verification.actualOpenStatus, 'UNKNOWN');
assert.equal(verification.checkedAt, null, '직원 확인 전 checkedAt은 비어 있어야 합니다.');

const analysis = analyzeProductNeeds(verification);
assert.equal(analysis.recommend.length, 0);
assert.equal(analysis.confirm.length, 4);

await assert.rejects(
  () => interpretNaturalSearch({ ...conditions, naturalQuery: '서울 강남구에서 최근 인허가된 일식 음식점' }),
  /지원하지 않는 지역/,
);

const rows = await searchRestaurants(conditions);
assert.ok(Array.isArray(rows));
assert.ok(rows.length > 0, '기본 Mock 검색은 최소 1건을 반환해야 합니다.');
assert.equal(normalizeRestaurantSearchResponse({ status: 'OK', items: rows }).length, rows.length);

assert.deepEqual(
  normalizeAnalysisResponse({ analysis: { recommend: [], confirm: [], exclude: [] } }),
  { recommend: [], confirm: [], exclude: [] },
);

assert.deepEqual(normalizeHistoryResponse({ items: [] }), []);

assert.throws(
  () => normalizeInterpretResponse({ status: 'OK' }, conditions),
  /지역 정보가 없습니다/,
  '서버 해석 응답이 비어 있을 때 기존 지역을 재사용하면 안 됩니다.',
);

assert.throws(
  () => normalizeRestaurantSearchResponse({ status: 'OK' }),
  /items 배열/,
);

assert.throws(
  () => normalizeProposalResponse({ strategy: {}, products: [], script: [] }),
  /strategy.points/,
);

console.log(`smoke ok: ${rows.length} mock restaurants, D-2=${conditions.permitDateTo}`);
