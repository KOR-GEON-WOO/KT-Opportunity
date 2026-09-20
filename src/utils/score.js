export function getHouseholdScore(householdCount) {
  if (householdCount >= 300) return 60;
  if (householdCount >= 200) return 45;
  if (householdCount >= 100) return 30;
  return 15;
}

export function getAgeScore(buildingAge) {
  if (buildingAge >= 20) return 40;
  if (buildingAge >= 15) return 30;
  if (buildingAge >= 10) return 20;
  if (buildingAge >= 5) return 10;
  return 5;
}

export function calculatePriority(candidates) {
  return candidates
    .filter((candidate) => candidate.installStatus === "PASS")
    .map((candidate) => {
      const householdScore = getHouseholdScore(candidate.householdCount);
      const ageScore = getAgeScore(candidate.buildingAge);

      return {
        ...candidate,
        householdScore,
        ageScore,
        priorityScore: householdScore + ageScore,
      };
    })
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }

      if (b.householdCount !== a.householdCount) {
        return b.householdCount - a.householdCount;
      }

      if (b.buildingAge !== a.buildingAge) {
        return b.buildingAge - a.buildingAge;
      }

      return a.candidateId.localeCompare(b.candidateId);
    })
    .map((candidate, index) => ({
      ...candidate,
      priorityRank: index + 1,
    }));
}
