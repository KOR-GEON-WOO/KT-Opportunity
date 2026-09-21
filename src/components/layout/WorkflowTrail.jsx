import { useAgent } from '../../app/AgentProvider.jsx';

const stages = [
  { id: 'discovery', label: '탐색 · 확인' },
  { id: 'proposal', label: '맞춤 제안' },
  { id: 'followup', label: '후속 상담' },
  { id: 'history', label: '이력 확인' },
];

export default function WorkflowTrail({ page, onNavigate }) {
  const { selectedStore, proposal, saveResult } = useAgent();
  const currentIndex = stages.findIndex((stage) => stage.id === page);
  if (currentIndex < 0) return null;

  const completed = {
    discovery: Boolean(selectedStore),
    proposal: Boolean(proposal),
    followup: Boolean(saveResult),
    history: false,
  };
  const enabled = {
    discovery: true,
    proposal: Boolean(selectedStore && proposal),
    followup: Boolean(selectedStore),
    history: true,
  };

  return (
    <nav className="workflow-trail" aria-label="현재 영업 업무 단계">
      <ol>
        {stages.map((stage, index) => {
          const current = index === currentIndex;
          const done = completed[stage.id] && !current;
          const canNavigate = enabled[stage.id] && stage.id !== page;
          const content = <><span className="workflow-trail-index" aria-hidden="true">{done ? '✓' : index + 1}</span><span>{stage.label}</span></>;
          return (
            <li key={stage.id} className={current ? 'current' : done ? 'done' : 'available'} aria-current={current ? 'step' : undefined}>
              {canNavigate ? <button type="button" onClick={() => onNavigate(stage.id)} aria-label={`${stage.label} 단계로 이동`}>{content}</button> : <div aria-disabled={!enabled[stage.id] && !current ? 'true' : undefined}>{content}</div>}
            </li>
          );
        })}
      </ol>
      <p className="workflow-trail-context" aria-live="polite">{selectedStore ? `${selectedStore.storeName} · ${proposal ? (saveResult ? '상담 저장 완료' : '맞춤 제안 준비됨') : '상태 확인 진행 중'}` : '매장을 선택하면 업무 단계가 연결됩니다.'}</p>
    </nav>
  );
}
