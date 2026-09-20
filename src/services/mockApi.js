import {
  mockCandidates,
  mockProducts,
  mockHistory,
} from "../data/mockData";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function interpretSearchConditions(conditions) {
  await wait(700);

  return {
    targetArea: conditions.targetArea,
    minBuildingAge: Number(conditions.minBuildingAge || 0),
    maxBuildingAge:
      conditions.maxBuildingAge === ""
        ? null
        : Number(conditions.maxBuildingAge),
    minHouseholds: Number(conditions.minHouseholds || 0),
    buildingTypes: conditions.buildingTypes,
  };
}

export async function fetchCandidates() {
  await wait(900);
  return structuredClone(mockCandidates);
}

export async function generateRecommendation(candidate) {
  await wait(1200);

  const product =
    candidate.householdCount >= 250 ? mockProducts[0] : mockProducts[1];

  return {
    candidateId: candidate.candidateId,
    product,
    reason: `${candidate.householdCount}세대 규모와 ${candidate.buildingAge}년의 건물 연식을 고려했을 때, 검수된 상품 DB 중 상담 우선도가 높은 상품입니다.`,
    salesPoints: [
      "설치 가능 상태를 직원이 사전 확인한 후보지",
      `방문 우선순위 ${candidate.priorityRank}위 / ${candidate.priorityScore}점`,
      `${candidate.householdCount}세대 규모의 공동주택`,
    ],
    script: `안녕하세요. KT 인터넷 상담을 위해 방문드렸습니다. 현재 이 건물은 사전 확인 기준 설치 가능 대상으로 확인되었습니다. 사용 중인 인터넷 환경과 이용 패턴을 먼저 확인한 뒤, 조건에 맞는 상품을 안내드리겠습니다.`,
  };
}

export async function saveApprovedCandidates(payload) {
  await wait(800);

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
