import {
  mockCandidates,
  mockProducts,
  mockHistory,
} from "../data/mockData";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeArea(text) {
  return text
    .replace(/\s+/g, " ")
    .replace("대전 서구", "대전광역시 서구")
    .trim();
}

function parseNumber(text, pattern) {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
}

function parseNaturalQuery(query, fallback) {
  const text = (query ?? "").trim();
  if (!text) return fallback;

  const minAge =
    parseNumber(text, /(\d+)\s*년\s*(?:이상|넘는|지난)/) ??
    Number(fallback.minBuildingAge || 0);

  const maxAge =
    parseNumber(text, /(\d+)\s*년\s*(?:이하|미만)/) ??
    (fallback.maxBuildingAge === "" ? null : Number(fallback.maxBuildingAge));

  const minHouseholds =
    parseNumber(text, /(\d+)\s*세대\s*(?:이상|넘는)/) ??
    Number(fallback.minHouseholds || 0);

  const areaMatch = text.match(
    /(대전(?:광역시)?\s*서구(?:\s*[가-힣]+동)?|서울(?:특별시)?\s*[가-힣]+구(?:\s*[가-힣]+동)?|부산(?:광역시)?\s*[가-힣]+구(?:\s*[가-힣]+동)?)/
  );

  let targetArea = fallback.targetArea;
  if (areaMatch?.[1]) {
    targetArea = normalizeArea(areaMatch[1]);
  }

  const types = [];
  if (/아파트/.test(text)) types.push("아파트");
  if (/다세대/.test(text)) types.push("다세대");
  if (/연립/.test(text)) types.push("연립");

  return {
    targetArea,
    minBuildingAge: minAge,
    maxBuildingAge: maxAge,
    minHouseholds,
    buildingTypes: types.length ? types : fallback.buildingTypes,
  };
}

export async function interpretSearchConditions(conditions, onStage) {
  onStage?.(0);
  await wait(350);

  const interpreted = parseNaturalQuery(conditions.naturalQuery, conditions);

  onStage?.(1);
  await wait(250);

  const targetArea = normalizeArea(interpreted.targetArea);

  onStage?.(2);
  await wait(220);

  if (!targetArea) {
    throw new Error("영업 지역을 해석할 수 없습니다.");
  }

  return {
    targetArea,
    minBuildingAge: Number(interpreted.minBuildingAge || 0),
    maxBuildingAge:
      interpreted.maxBuildingAge === "" ||
      interpreted.maxBuildingAge === null ||
      interpreted.maxBuildingAge === undefined
        ? null
        : Number(interpreted.maxBuildingAge),
    minHouseholds: Number(interpreted.minHouseholds || 0),
    buildingTypes: interpreted.buildingTypes,
  };
}

function candidateMatches(candidate, conditions) {
  const typeMatches =
    !conditions.buildingTypes?.length ||
    conditions.buildingTypes.some((type) => {
      if (type === "아파트") return candidate.buildingType === "아파트";
      return candidate.buildingType === type;
    });

  const ageMatches =
    candidate.buildingAge >= Number(conditions.minBuildingAge || 0) &&
    (conditions.maxBuildingAge === null ||
      conditions.maxBuildingAge === undefined ||
      candidate.buildingAge <= Number(conditions.maxBuildingAge));

  const householdMatches =
    candidate.householdCount >= Number(conditions.minHouseholds || 0);

  const areaMatches =
    !conditions.targetArea ||
    candidate.address.includes(
      conditions.targetArea
        .replace("대전광역시", "대전광역시")
        .replace(/\s+/g, " ")
        .split(" ")
        .slice(0, 3)
        .join(" ")
    ) ||
    candidate.address.includes("대전광역시 서구 탄방동");

  return typeMatches && ageMatches && householdMatches && areaMatches;
}

export async function fetchCandidates(conditions, onStage) {
  onStage?.(0);
  await wait(420);

  onStage?.(1);
  await wait(250);

  onStage?.(2);
  await wait(250);

  const filtered = mockCandidates.filter((candidate) =>
    candidateMatches(candidate, conditions)
  );

  onStage?.(3);
  await wait(220);

  return structuredClone(filtered);
}

function isProductValid(product, now = new Date()) {
  const start = new Date(`${product.validFrom}T00:00:00`);
  const end = new Date(`${product.validTo}T23:59:59`);
  return start <= now && now <= end;
}

function pickValidProduct(candidate) {
  const validProducts = mockProducts.filter((product) => isProductValid(product));

  if (!validProducts.length) return null;

  if (candidate.householdCount >= 250) {
    return (
      validProducts.find((product) => product.productCode === "PRD_GIGA_1G") ??
      validProducts[0]
    );
  }

  return (
    validProducts.find((product) => product.productCode === "PRD_GIGA_500M") ??
    validProducts[0]
  );
}

export async function generateRecommendation(candidate, onStage) {
  onStage?.(0);
  await wait(320);

  const product = pickValidProduct(candidate);

  onStage?.(1);
  await wait(420);

  if (!product) {
    return {
      candidateId: candidate.candidateId,
      product: null,
      requiresReview: true,
      reviewReason: "현재 유효기간 내 검수 완료 상품이 없습니다.",
      reason: "상품 재검수가 필요합니다.",
      salesPoints: [
        "설치 가능 상태는 확인됨",
        `방문 우선순위 ${candidate.priorityRank}위 / ${candidate.priorityScore}점`,
      ],
      script:
        "현재 검수 완료된 상품 정보가 없어 구체적인 가격이나 혜택을 안내하지 않습니다. 현장에서는 고객의 이용 환경을 확인한 뒤 최신 상품 정보를 다시 검수해 안내해 주세요.",
    };
  }

  onStage?.(2);
  await wait(280);

  onStage?.(3);
  await wait(420);

  return {
    candidateId: candidate.candidateId,
    product,
    requiresReview: false,
    reason: `${candidate.householdCount}세대 규모와 ${candidate.buildingAge}년의 건물 연식을 고려했을 때, 검수된 상품 DB 중 상담 우선도가 높은 상품입니다.`,
    salesPoints: [
      "설치 가능 상태를 직원이 사전 확인한 후보지",
      `방문 우선순위 ${candidate.priorityRank}위 / ${candidate.priorityScore}점`,
      `${candidate.householdCount}세대 규모의 공동주택`,
    ],
    script:
      "안녕하세요. KT 인터넷 상담을 위해 방문드렸습니다. 현재 이 건물은 사전 확인 기준 설치 가능 대상으로 확인되었습니다. 사용 중인 인터넷 환경과 이용 패턴을 먼저 확인한 뒤, 검수된 최신 상품 정보 범위 안에서 적합한 상품을 안내드리겠습니다.",
  };
}

export async function saveApprovedCandidates(payload) {
  await wait(600);

  if (!payload?.length) {
    throw new Error("저장할 후보 데이터가 없습니다.");
  }

  const invalid = payload.find((item) => item.saveApproved !== true);
  if (invalid) {
    throw new Error("최종 승인되지 않은 데이터가 포함되어 있습니다.");
  }

  return {
    ok: true,
    savedCount: payload.length,
    savedAt: new Date().toISOString(),
  };
}

export async function fetchHistory() {
  await wait(350);
  return structuredClone(mockHistory);
}
