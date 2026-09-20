import SearchPanel from './SearchPanel.jsx';
import LeadList from './LeadList.jsx';
import OpportunityPanel from './OpportunityPanel.jsx';
import { useAgent } from '../../app/AgentProvider.jsx';

export default function Discovery({ onNavigate }) {
  const { error, persistenceWarning } = useAgent();
  return (
    <div className="page-stack discovery-page">
      {error && <div className="global-error" role="alert">{error}</div>}
      {persistenceWarning && <div className="global-warning" role="status">{persistenceWarning}</div>}
      <SearchPanel />
      <div className="master-detail">
        <LeadList />
        <OpportunityPanel onProposal={() => onNavigate('proposal')} />
      </div>
    </div>
  );
}
