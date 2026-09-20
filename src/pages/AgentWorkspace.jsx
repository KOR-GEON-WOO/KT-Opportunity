import Stepper from "../components/Stepper";
import ApiSourceCard from "../components/ApiSourceCard";
import RestaurantSearchForm from "../components/RestaurantSearchForm";
import RestaurantResults from "../components/RestaurantResults";
import StoreVerification from "../components/StoreVerification";
import ProductRuleAnalysis from "../components/ProductRuleAnalysis";
import ProposalWorkspace from "../components/ProposalWorkspace";
import FollowUpForm from "../components/FollowUpForm";
import LoadingStep from "../components/LoadingStep";
import ErrorState from "../components/ErrorState";
import { useEffect } from "react";
import { useRestaurantAgent } from "../hooks/useRestaurantAgent";

export default function AgentWorkspace({ agentRef, onStepChange }) {
  const agent = useRestaurantAgent();
  agentRef.current = agent;
  useEffect(() => {
    onStepChange?.(agent.step);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [agent.step, onStepChange]);

  if (agent.loading) {
    return <div className="page-width"><Stepper step={agent.step} /><LoadingStep {...agent.loading} /></div>;
  }

  return (
    <div className="page-width">
      <Stepper step={agent.step} />
      <ErrorState message={agent.error} onClose={() => agent.setError(null)} />

      {agent.step === 1 && (
        <>
          <section className="hero-strip" id="agent-main-banner">
            <div><span className="eyebrow">NEW STORE OPPORTUNITY</span><h1><span className="hero-title-line">최근 인허가 음식점에서</span><span className="hero-title-line"><em>다음 영업 기회</em>를 찾습니다.</span></h1><p>공공데이터로 후보를 찾고, 직원 확인과 규칙 판별을 거쳐 검수된 KT 상품만 제안합니다.</p></div>
            <div className="hero-metrics"><div><span>DATA</span><strong>행정안전부</strong><small>일반음식점 OpenAPI</small></div><div><span>FILTER</span><strong>영업/정상</strong><small>인허가일 최신순</small></div><div><span>AI</span><strong>2-Model</strong><small>HyperCLOVA X → Mi:dm</small></div></div>
          </section>
          <div className="search-layout"><RestaurantSearchForm value={agent.conditions} onChange={agent.setConditions} onInterpret={agent.interpretSearch} onSearch={agent.search} /><ApiSourceCard resultCount={agent.restaurants.length} /></div>
          <RestaurantResults restaurants={agent.restaurants} onSelect={agent.selectStore} />
        </>
      )}

      {agent.step === 2 && agent.selectedStore && <StoreVerification store={agent.selectedStore} value={agent.verification} onChange={agent.setVerification} onBack={() => agent.setStep(1)} onNext={agent.confirmVerification} />}
      {agent.step === 3 && agent.selectedStore && agent.analysis && <ProductRuleAnalysis store={agent.selectedStore} analysis={agent.analysis} verification={agent.verification} onBack={() => agent.setStep(2)} onGenerate={agent.generateProposal} onSkip={agent.goToFollowUp} />}
      {agent.step === 4 && agent.selectedStore && agent.proposal && <ProposalWorkspace store={agent.selectedStore} proposal={agent.proposal} analysis={agent.analysis} onBack={() => agent.setStep(3)} onNext={agent.goToFollowUp} />}
      {agent.step === 5 && agent.selectedStore && <FollowUpForm store={agent.selectedStore} proposal={agent.proposal} saveResult={agent.saveResult} onSave={agent.saveFollowUp} onBack={() => agent.proposal ? agent.setStep(4) : agent.setStep(3)} onNewSearch={agent.newSearch} />}
    </div>
  );
}
