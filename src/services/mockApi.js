import {
  baseHistory,
  mockRestaurants,
  verifiedProducts,
} from "../data/mockData.js";
import { analyzeProductNeeds } from "../utils/rules.js";
import { kstIsoNow } from "../utils/format.js";
import { loadHistory, upsertHistory } from "../utils/storage.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function interpretNaturalSearch(conditions, onStage) {
  onStage?.(0);
  await wait(260);
  const query = conditions.naturalQuery?.trim() ?? "";

  const next = { ...conditions };
  if (/충남|충청남도/.test(query)) next.regionLevel1 = "충청남도";
  if (/충북|충청북도/.test(query)) next.regionLevel1 = "충청북도";
  if (/대전/.test(query)) next.regionLevel1 = "대전광역시";
  if (/세종/.test(query)) next.regionLevel1 = "세종특별자치시";

  if (/천안/.test(query)) next.regionLevel2 = "천안시";
  if (/아산/.test(query)) next.regionLevel2 = "아산시";
  if (/청주/.test(query)) next.regionLevel2 = "청주시";
  if (/충주/.test(query)) next.regionLevel2 = "충주시";
  if (/서구/.test(query) && next.regionLevel1 === "대전광역시") next.regionLevel2 = "서구";
  if (/유성구/.test(query) && next.regionLevel1 === "대전광역시") next.regionLevel2 = "유성구";

  const typeMatch = query.match(/(한식|일식|중식|경양식|분식)/);
  if (typeMatch) next.businessType = typeMatch[1];

  onStage?.(1);
  await wait(220);
  onStage?.(2);
  await wait(180);

  return next;
}

export async function searchRestaurants(conditions, onStage) {
  onStage?.(0);
  await wait(300);
  onStage?.(1);
  await wait(250);

  const result = mockRestaurants
    .filter((store) => store.regionLevel1 === conditions.regionLevel1)
    .filter((store) => store.regionLevel2 === conditions.regionLevel2)
    .filter((store) => store.permitDate >= conditions.permitDateFrom)
    .filter((store) => store.permitDate <= conditions.permitDateTo)
    .filter((store) =>
      conditions.businessStatus ? store.businessStatus === conditions.businessStatus : true
    )
    .filter((store) =>
      !conditions.businessType || conditions.businessType === "전체"
        ? true
        : store.businessType === conditions.businessType
    )
    .filter((store) =>
      conditions.storeNameKeyword
        ? store.storeName.includes(conditions.storeNameKeyword.trim())
        : true
    )
    .sort((a, b) => b.permitDate.localeCompare(a.permitDate));

  onStage?.(2);
  await wait(180);
  onStage?.(3);
  await wait(140);

  return structuredClone(result);
}

export async function runRuleAnalysis(verification) {
  await wait(300);
  return analyzeProductNeeds(verification);
}

function productIsValid(product, date = "2026-09-18") {
  return product.validFrom <= date && date <= product.validTo;
}

export async function generateProposal(store, verification, analysis, onStage) {
  onStage?.(0);
  await wait(480);

  const recommendedCategories = new Set(analysis.recommend.map((item) => item.category));
  const products = verifiedProducts.filter(
    (product) => recommendedCategories.has(product.productCategory) && productIsValid(product)
  );

  const catalogMissing = analysis.recommend
    .filter((item) => !products.some((p) => p.productCategory === item.category))
    .map((item) => ({
      category: item.category,
      reason: "검수된 KT 상품 기준 데이터가 등록되지 않아 구체 상품을 생성하지 않습니다.",
    }));

  const area = store.area ?? store.facilitySize ?? null;
  const sizeSignal = area === null ? "매장 규모 추가 확인" : area >= 120 ? "중대형 매장" : area >= 70 ? "중형 매장" : "소형 매장";
  const priority = verification.actualOpenStatus === "OPEN" && store.permitDate >= "2026-09-10" ? "HIGH" : "MEDIUM";

  const strategy = {
    priority,
    summary: `${store.businessType ?? "일반"} 업태 · ${sizeSignal} · 인허가일 ${store.permitDate} 기준으로 신규 영업 가능성을 검토합니다.`,
    points: [
      `실제 개업 상태: ${verification.actualOpenStatus}`,
      area ? `소재지면적 ${area}㎡ 기반 사용 환경 확인` : "매장 면적 정보 추가 확인",
      `추천 후보 상품군 ${analysis.recommend.length}개 / 추가 확인 ${analysis.confirm.length}개`,
    ],
    additionalChecks: [
      ...analysis.confirm.map((item) => `${item.category}: ${item.reason}`),
      ...catalogMissing.map((item) => `${item.category}: ${item.reason}`),
    ],
  };

  onStage?.(1);
  await wait(420);
  onStage?.(2);
  await wait(360);

  const internetProduct = products.find((item) => item.productCategory === "INTERNET");
  const productPhrase = internetProduct
    ? `검수된 ${internetProduct.productName}(${internetProduct.productCode})`
    : "검수 완료된 상품 데이터";

  const script = [
    `안녕하세요. 신규 매장 운영 준비와 관련해 KT B2B 통신 환경을 함께 확인드리려고 방문했습니다.`,
    `현재 ${store.storeName}은 직원 확인 기준 ${verification.actualOpenStatus === "PREPARING" ? "개업 준비" : "개업"} 상태이며, 확인된 계약 상태에서 미정인 항목을 중심으로 안내드리겠습니다.`,
    internetProduct && verification.installStatus === "PASS"
      ? `KT 인터넷은 설치 가능 상태로 확인되어 ${productPhrase} 범위에서 실제 사용 환경과 가입 조건을 확인해 보겠습니다.`
      : `확인되지 않은 가격이나 혜택은 임의로 안내하지 않고, 추가 확인이 필요한 항목부터 점검하겠습니다.`,
  ].filter(Boolean);

  onStage?.(3);
  await wait(360);

  return {
    strategy,
    products,
    catalogMissing,
    script,
    generatedAt: kstIsoNow(),
    modelFlow: ["HyperCLOVA X SEED Think 14B", "VRAM 반환 확인", "KT Mi:dm 2.0"],
  };
}

export async function saveFollowUp(payload) {
  await wait(380);
  if (payload.saveApproved !== true) {
    throw new Error("직원의 최종 저장 승인이 필요합니다.");
  }
  upsertHistory(payload);
  return { ok: true, savedAt: payload.updatedAt };
}

export async function fetchHistory() {
  await wait(180);
  const current = loadHistory();
  const byId = new Map(baseHistory.map((item) => [item.storeId, item]));
  current.forEach((item) => byId.set(item.storeId, item));
  return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
