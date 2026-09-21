export function getOperationalGuidance(message = '', context = 'general') {
  const text = String(message);
  if (/catalog|productCode|productName|검수 가격|검수.*상품/i.test(text)) {
    return {
      title: '검수 상품 정보가 일치하지 않습니다',
      detail: '생성 결과는 승인된 KT 상품 catalog와 일치해야 합니다. 임의 상품으로 저장하지 말고 매장 상태를 확인한 뒤 제안을 다시 생성하세요.',
      actionLabel: '매장 상태 확인',
      actionPage: 'discovery',
    };
  }
  if (/saveApproved|최종 확인|저장 승인/i.test(text)) {
    return {
      title: '최종 저장 승인이 필요합니다',
      detail: '상담 내용을 다시 확인한 뒤 최종 확인 체크박스를 선택해야 저장할 수 있습니다.',
    };
  }
  if (/KST ISO 8601|timestamp|updatedAt|approvedAt/i.test(text)) {
    return {
      title: '상담 기록 시간 형식을 확인할 수 없습니다',
      detail: '잘못된 시간 값을 임의 보정하지 않습니다. 현재 화면의 입력은 유지되므로 잠시 후 다시 저장해 주세요.',
    };
  }
  if (/TIMEOUT|시간 초과|timeout|계속 진행 중/i.test(text)) {
    return {
      title: '처리 결과 확인이 지연되고 있습니다',
      detail: '중복 실행은 피하고 현재 요청의 결과를 확인한 뒤 다시 시도하세요. F-04는 한 번에 하나의 모델만 사용하는 순차 작업입니다.',
    };
  }
  return {
    title: context === 'save' ? '상담 기록을 저장하지 못했습니다' : '요청을 완료하지 못했습니다',
    detail: '입력한 내용은 화면에 유지됩니다. 오류 내용을 확인한 뒤 안전하게 다시 시도하세요.',
  };
}

export default function OperationalNotice({ message, context = 'general', onNavigate }) {
  if (!message) return null;
  const guidance = getOperationalGuidance(message, context);
  return (
    <section className="operational-notice" role="alert" aria-live="assertive">
      <div className="operational-notice-copy">
        <span className="eyebrow">ACTION REQUIRED</span>
        <strong>{guidance.title}</strong>
        <p>{guidance.detail}</p>
        <details><summary>오류 상세 보기</summary><code>{message}</code></details>
      </div>
      {guidance.actionPage && onNavigate && (
        <button type="button" className="button subtle" onClick={() => onNavigate(guidance.actionPage)}>{guidance.actionLabel}</button>
      )}
    </section>
  );
}
