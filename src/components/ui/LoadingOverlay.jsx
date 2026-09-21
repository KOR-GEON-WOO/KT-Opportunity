export default function LoadingOverlay({ value }) {
  if (!value) return null;
  const pipeline = Array.isArray(value.pipeline) ? value.pipeline : [];
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-atomic="true">
      <div className="loading-card">
        <div className="loading-spinner" aria-hidden="true" />
        <div className="loading-copy">
          <strong>{value.title}</strong>
          <p>{value.detail}</p>
        </div>
        <div className="loading-stages" aria-label="작업 진행 단계">
          {value.stages?.map((stage, index) => (
            <div key={stage} className={index < value.stageIndex ? 'done' : index === value.stageIndex ? 'active' : ''}>
              <span aria-hidden="true">{index < value.stageIndex ? '✓' : index + 1}</span>
              <p>{stage}</p>
            </div>
          ))}
        </div>
        {pipeline.length > 0 && (
          <div className="model-pipeline" aria-label="F-04 단일 Queue 모델 교대 흐름">
            <div className="model-pipeline-head">
              <strong>F-04 단일 Queue</strong>
              <span>{value.pipelineStageIndex == null ? '서버 순차 처리' : '단계 추적'}</span>
            </div>
            <div className="model-pipeline-steps">
              {pipeline.map((item, index) => {
                const tracked = Number.isInteger(value.pipelineStageIndex);
                const done = tracked && index < value.pipelineStageIndex;
                const active = tracked && index === value.pipelineStageIndex;
                return (
                  <div key={item.label} className={done ? 'done' : active ? 'active' : ''}>
                    <span aria-hidden="true">{done ? '✓' : index + 1}</span>
                    <p><strong>{item.label}</strong><small>{item.detail}</small></p>
                  </div>
                );
              })}
            </div>
            <p className="model-pipeline-note">12GB VRAM 환경에서 두 모델은 동시 상주하지 않습니다. 모델 전환은 VRAM 반환 확인 뒤에만 진행합니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
