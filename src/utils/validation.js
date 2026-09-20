import { regionOptions } from '../data/mockData.js';

export function validateSearch(conditions) {
  const errors = {};
  if (!conditions.regionLevel1) errors.regionLevel1 = '상위 지역을 선택해 주세요.';
  if (!conditions.regionLevel2) errors.regionLevel2 = '하위 지역을 선택해 주세요.';
  if (conditions.regionLevel1 && conditions.regionLevel2) {
    const children = regionOptions[conditions.regionLevel1] || [];
    if (!children.includes(conditions.regionLevel2)) {
      errors.regionLevel2 = '선택한 상위 지역에 존재하지 않는 하위 지역입니다.';
    }
  }
  if (!conditions.permitDateFrom) errors.permitDateFrom = '조회 시작일이 필요합니다.';
  if (!conditions.permitDateTo) errors.permitDateTo = '조회 종료일이 필요합니다.';
  if (conditions.permitDateFrom && conditions.permitDateTo && conditions.permitDateFrom > conditions.permitDateTo) {
    errors.permitDateTo = '종료일은 시작일보다 빠를 수 없습니다.';
  }
  return errors;
}

export function validateVerification(value) {
  const errors = {};
  if (!value.actualOpenStatus || value.actualOpenStatus === 'UNKNOWN') {
    errors.actualOpenStatus = '실제 개업 상태를 직원이 확인해 주세요.';
  }
  if (!value.internetStatus) errors.internetStatus = '인터넷 계약 상태를 확인해 주세요.';
  if (value.internetStatus === 'UNDECIDED' && (!value.installStatus || value.installStatus === 'UNKNOWN')) {
    errors.installStatus = '인터넷이 미정이면 KT 설치 가능 여부를 확인해 주세요.';
  }
  if (!value.checkedAt) errors.checkedAt = '확인일이 필요합니다.';
  return errors;
}
