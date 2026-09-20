const steps = ["후보 발굴", "매장 확인", "상품 분석", "AI 상담안", "후속관리"];

export default function Stepper({ step }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper-mobile-head">
        <span>STEP {step} / 5</span><strong>{steps[step - 1]}</strong>
      </div>
      <div className="stepper">
        {steps.map((label, index) => {
          const id = index + 1;
          return (
            <div key={label} className={id === step ? "step current" : id < step ? "step done" : "step"}>
              <span>{id < step ? "✓" : id}</span>
              <strong>{label}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
