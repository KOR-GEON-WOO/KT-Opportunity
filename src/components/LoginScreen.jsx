export default function LoginScreen({ onLogin }) {
  const goToBanner = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="login-page" id="main-banner">
      <section className="login-panel">
        <button
          className="login-brand"
          type="button"
          onClick={goToBanner}
          aria-label="KT Opportunity 메인 배너로 이동"
        >
          <img src="/assets/kt-wordmark-standard.png" alt="KT" />
          <span className="login-brand-divider" aria-hidden="true" />
          <strong>Opportunity</strong>
        </button>

        <div className="login-copy">
          <span className="eyebrow">KT B2B SALES · PoC</span>
          <h1>
            <span className="login-title-line">새로 문 연 음식점을</span>
            <span className="login-title-line">영업 기회로 연결합니다.</span>
          </h1>
          <p>
            행정안전부 일반음식점 인허가 데이터와 직원 확인 정보를 결합해
            미정 상품을 찾고, 검수된 KT 상품 범위에서 상담안을 생성합니다.
          </p>
        </div>

        <div className="login-flow" aria-label="Agent 흐름">
          <span>신규 음식점</span><i>→</i><span>직원 확인</span><i>→</i><span>상품 분석</span><i>→</i><span>AI 상담안</span>
        </div>

        <button className="login-button" type="button" onClick={onLogin}>
          PoC 테스트 세션 시작
          <span aria-hidden="true">→</span>
        </button>
        <small className="login-note">
          실제 연동 시 n8n 인증 Webhook이 테스트 계정을 검증하고 서버 세션을 관리합니다.
        </small>
      </section>

      <aside className="login-visual" aria-hidden="true">
        <div className="signal-grid" />
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="visual-card card-api">
          <span>DATA SOURCE</span>
          <strong>LOCALDATA / 일반음식점</strong>
          <small>OpenAPI · /info</small>
        </div>
        <div className="visual-card card-ai">
          <span>LOCAL AI</span>
          <strong>HyperCLOVA X → Mi:dm</strong>
          <small>Queue · Model Swap · JSON Validation</small>
        </div>
        <div className="visual-card card-human">
          <span>HUMAN GATE</span>
          <strong>직원 확인 · 최종 승인</strong>
          <small>UNKNOWN 유지 · 임의 추정 금지</small>
        </div>
      </aside>
    </main>
  );
}
