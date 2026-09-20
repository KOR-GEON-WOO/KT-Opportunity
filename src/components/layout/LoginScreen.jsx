export default function LoginScreen({ onLogin }) {
  return (
    <main className="login-screen">
      <section className="login-brand-panel">
        <div className="login-brand-inner">
          <img src="/assets/kt-wordmark-white.png" alt="KT" className="login-logo" />
          <span className="eyebrow light">B2B SALES OPPORTUNITY AGENT</span>
          <h1>새로 문 연 음식점을<br />영업 기회로 연결합니다.</h1>
          <p>최근 인허가 음식점을 찾고, 직원 확인을 거쳐 실제 제안 가능한 KT 상품과 상담 흐름을 준비합니다.</p>
          <div className="login-flow">
            <span>신규 음식점 탐색</span><i>→</i><span>영업 기회 확인</span><i>→</i><span>맞춤 제안</span>
          </div>
        </div>
      </section>
      <section className="login-action-panel">
        <div className="login-card">
          <span className="eyebrow">KT SALES WORKSPACE</span>
          <h2>영업 Agent 시작</h2>
          <p>현재 버전은 PoC 테스트 세션입니다. 실제 운영 시 서버 세션 인증 또는 Cloudflare Access를 연결합니다.</p>
          <div className="login-security-note">
            <strong>데이터 원칙</strong>
            <span>확인되지 않은 개업·계약 상태는 UNKNOWN으로 유지하고 Agent가 임의로 추정하지 않습니다.</span>
          </div>
          <button type="button" className="button primary xl" onClick={onLogin}>PoC 테스트 세션 시작 <span>→</span></button>
          <small>LOCALDATA · n8n · HyperCLOVA X · KT Mi:dm</small>
        </div>
      </section>
    </main>
  );
}
