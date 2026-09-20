export function validateSearchConditions(conditions) {
  const errors = {};

  if (!conditions.targetArea?.trim()) {
    errors.targetArea = "영업 지역을 입력하세요.";
  }

  const minAge = Number(conditions.minBuildingAge);
  const maxAge =
    conditions.maxBuildingAge === "" ? null : Number(conditions.maxBuildingAge);
  const minHouseholds = Number(conditions.minHouseholds);

  if (Number.isNaN(minAge) || minAge < 0) {
    errors.minBuildingAge = "최소 건물 연식은 0 이상이어야 합니다.";
  }

  if (maxAge !== null && (Number.isNaN(maxAge) || maxAge < minAge)) {
    errors.maxBuildingAge = "최대 건물 연식은 최소 연식보다 커야 합니다.";
  }

  if (Number.isNaN(minHouseholds) || minHouseholds < 0) {
    errors.minHouseholds = "최소 세대수는 0 이상이어야 합니다.";
  }

  if (!conditions.buildingTypes?.length) {
    errors.buildingTypes = "건물 유형을 하나 이상 선택하세요.";
  }

  return errors;
}
