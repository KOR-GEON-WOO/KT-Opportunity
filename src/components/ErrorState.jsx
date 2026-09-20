export default function ErrorState({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="inline-error" role="alert">
      <span>!</span>
      <div><strong>확인이 필요합니다</strong><p>{message}</p></div>
      <button type="button" onClick={onClose} aria-label="오류 닫기">×</button>
    </div>
  );
}
