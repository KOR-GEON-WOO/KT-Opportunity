import {
  mockCandidates,
  mockProducts,
  mockHistory,
} from "../data/mockData";
import {
  loadStoredHistory,
  upsertStoredHistory,
} from "../utils/storage";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const REGION_ALIASES = {
  서울: "서울특별시",
  서울특별시: "서울특별시",
  부산: "부산광역시",
  부산광역시: "부산광역시",
  대구: "대구광역시",
  대구광역시: "대구광역시",
  인천: "인천광역시",
  인천광역시: "인천광역시",
  광주: "광주광역시",
  광주광역시: "광주광역시",
  대전: "대전광역시",
  대전광역시: "대전광역시",
  울산: "울산광역시",
  울산광역시: "울산광역시",
  세종: "세종특별자치시",
  세종특별자치시: "세종특별자치시",
  경기: "경기도",
  경기도: "경기도",
  강원: "강원특별자치도",
  강원도: "강원특별자치도",
  강원특별자치도: "강원특별자치도",
  충북: "충청북도",
  충청북도: "충청북도",
  충남: "충청남도",
  충청남도: "충청남도",
  전북: "전북특별자치도",
  전라북도: "전북특별자치도",
  전북특별자치도: "전북특별자치도",
  전남: "전라남도",
  전라남도: "전라남도",
  경북: "경상북도",
  경상북도: "경상북도",
  경남: "경상남도",
  경상남도: "경상남도",
  제주: "제주특별자치도",
  제주도: "제주특별자치도",
  제주특별자치도: "제주특별자치도",
};

const REGION_PATTERN = Object.keys(REGION_ALIASES)
  .sort((a, b) => b.length - a.length)
  .join("|");

function normalizeWhitespace(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function normalizeArea(text = "") {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return "";

  const tokens = normalized.split(" ");
  const region = REGION_ALIASES[tokens[0]];

  if (region) {
    tokens[0] = region;
  }

  return tokens.join(" ");
}

function parseNumber(text, pattern) {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
}

function extractArea(text) {
  const match = text.match(
    new RegExp(
      `(${REGION_PATTERN})(?:\\s+([가-힣]+(?:시|군|구)))?(?:\\s+([가-힣]+(?:동|읍|면)))?`
    )
  );

  if (match?.[1]) {
    return normalizeArea(
      [REGION_ALIASES[match[1]], match[2], match[3]]
        .filter(Boolean)
        .join(" ")
    );
  }

  const hasUnresolvedArea =
    /[가-힣]{1,12}(?:시|군|구|동|읍|면)(?:에서|의|\s|$)/.test(text);

  if (hasUnresolvedArea) {
    throw new Error(
      "지역을 정확히 해석하지 못했습니다. 시·도와 시·군·구를 함께 입력하거나 상세 조건에서 직접 지정해 주세요."
    );
  }

  return null;
}

function parseNaturalQuery(query, fallback) {
  const text = normalizeWhitespace(query);
  if (!text) {
    return {
      targetArea: normalizeArea(fallback.targetArea),
      minBuildingAge: Number(fallback.minBuildingAge || 0),
      maxBuildingAge:
        fallback.maxBuildingAge === "" ? null : Number(fallback.maxBuildingAge),
      minHouseholds: Number(fallback.minHouseholds || 0),
      buildingTypes: fallback.buildingTypes,
    };
  }

  const minAge =
    parseNumber(text, /(\d+)\s*년\s*(?:이상|넘는|지난)/) ??
    Number(fallback.minBuildingAge || 0);

  const maxAge =
    parseNumber(text, /(\d+)\s*년\s*(?:이하|미만)/) ??
    (fallback.maxBuildingAge === "" ? null : Number(fallback.maxBuildingAge));

  const minHouseholds =
    parseNumber(text, /(\d+)\s*세대\s*(?:이상|넘는)/) ??
    Number(fallback.minHouseholds || 0);

  const extractedArea = extractArea(text);
  const targetArea = extractedArea ?? normalizeArea(fallback.targetArea);

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
  await wait(300);

  const interpreted = parseNaturalQuery(conditions.naturalQuery, conditions);

  onStage?.(1);
  await wait(220);

  const targetArea = normalizeArea(interpreted.targetArea);

  onStage?.(2);
  await wait(180);

  if (!targetArea) {
    throw new Error("영업 지역을 해석할 수 없습니다.");
  }

  if (
    interpreted.maxBuildingAge !== null &&
    Number(interpreted.maxBuildingAge) < Number(interpreted.minBuildingAge)
  ) {
    throw new Error("최대 건물 연식은 최소 건물 연식보다 작을 수 없습니다.");
  }

  return {
    targetArea,
    minBuildingAge: Number(interpreted.minBuildingAge || 0),
    maxBuildingAge:
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
    conditions.buildingTypes.includes(candidate.buildingType);

  const ageMatches =
    candidate.buildingAge >= Number(conditions.minBuildingAge || 0) &&
    (conditions.maxBuildingAge === null ||
      conditions.maxBuildingAge === undefined ||
      conditions.maxBuildingAge === "" ||
      candidate.buildingAge <= Number(conditions.maxBuildingAge));

  const householdMatches =
    candidate.householdCount >= Number(conditions.minHouseholds || 0);

  const normalizedTarget = normalizeArea(conditions.targetArea);
  const normalizedAddress = normalizeArea(candidate.address);

  const areaMatches =
    !normalizedTarget || normalizedAddress.startsWith(normalizedTarget);

  return typeMatches && ageMatches && householdMatches && areaMatches;
}

export async function fetchCandidates(conditions, onStage) {
  onStage?.(0);
  await wait(350);

  onStage?.(1);
  await wait(220);

  onStage?.(2);
  await wait(220);

  const filtered = mockCandidates.filter((candidate) =>
    candidateMatches(candidate, conditions)
  );

  onStage?.(3);
  await wait(180);

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
  await wait(280);

  const product = pickValidProduct(candidate);

  onStage?.(1);
  await wait(340);

  if (!product) {
    onStage?.(2);
    await wait(180);

    onStage?.(3);
    await wait(280);

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
  await wait(220);

  onStage?.(3);
  await wait(340);

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
  await wait(450);

  if (!payload?.length) {
    throw new Error("저장할 후보 데이터가 없습니다.");
  }

  const invalid = payload.find((item) => item.saveApproved !== true);
  if (invalid) {
    throw new Error("최종 승인되지 않은 데이터가 포함되어 있습니다.");
  }

  const storedRows = payload.map((item) => ({
    candidateId: item.candidateId,
    buildingName: item.buildingName,
    address: item.address,
    visitDate: item.visitDate,
    visitStatus: item.visitStatus,
    consultationResult: item.consultationResult,
    recommendedProductCode: item.recommendedProductCode,
    priorityScore: item.priorityScore,
    priorityRank: item.priorityRank,
    notes: item.notes,
    reviewRequired: Boolean(item.reviewRequired),
    updatedAt: item.updatedAt,
    approvedAt: item.approvedAt,
  }));

  upsertStoredHistory(storedRows);

  return {
    ok: true,
    savedCount: storedRows.length,
    savedAt: new Date().toISOString(),
  };
}

export async function fetchHistory() {
  await wait(250);

  const savedRows = loadStoredHistory();
  const byCandidateId = new Map(
    mockHistory.map((item) => [item.candidateId, item])
  );

  savedRows.forEach((item) => {
    byCandidateId.set(item.candidateId, item);
  });

  return structuredClone(
    [...byCandidateId.values()].sort((a, b) =>
      String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""))
    )
  );
}
