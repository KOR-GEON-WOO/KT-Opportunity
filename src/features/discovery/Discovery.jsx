import SearchPanel from './SearchPanel.jsx';
import LeadList from './LeadList.jsx';
import OpportunityPanel from './OpportunityPanel.jsx';
import { useAgent } from '../../app/AgentProvider.jsx';

export default function Discovery({ onNavigate }) {
  const { error, persistenceWarning, retryAction, retryLastAction } = useAgent();
  return (
    <div className="page-stack discovery-page">
      {error && <div className="global-error error-with-action" role="alert"><span>{error}</span>{retryAction && <button type="button" onClick={retryLastAction}>{retryAction.label}</button>}</div>}
      {persistenceWarning && <div className="global-warning" role="status">{persistenceWarning}</div>}
      <SearchPanel />
      <div className="master-detail">
        <LeadList />
        <OpportunityPanel onProposal={() => onNavigate('proposal')} />
      </div>
    </div>
  );
}
