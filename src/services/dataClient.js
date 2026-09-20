import * as mockApi from './mockApi.js';
import { n8nApi } from './n8nApi.js';
import {
  normalizeAnalysisResponse,
  normalizeAuthResponse,
  normalizeHistoryResponse,
  normalizeInterpretResponse,
  normalizeProposalResponse,
  normalizeRestaurantSearchResponse,
  normalizeSaveResponse,
  normalizeVerificationResponse,
} from './contracts.js';

export const dataMode = import.meta.env.VITE_DATA_MODE === 'n8n' ? 'n8n' : 'mock';
export const isMockMode = dataMode === 'mock';

async function n8nInterpret(conditions, onStage) {
  onStage?.(0);
  const raw = await n8nApi.interpretNaturalSearch(conditions);
  const result = normalizeInterpretResponse(raw, conditions);
  onStage?.(1);
  return result;
}

async function n8nSearch(conditions, onStage) {
  onStage?.(0);
  const raw = await n8nApi.searchRestaurants(conditions);
  const result = normalizeRestaurantSearchResponse(raw);
  onStage?.(1);
  return result;
}

async function n8nVerification(store, verification) {
  const raw = await n8nApi.verifyStore({ storeId: store.storeId, ...verification });
  return normalizeVerificationResponse(raw, verification);
}

async function n8nAnalysis(store, verification) {
  const raw = await n8nApi.analyzeProducts({ store, verification });
  return normalizeAnalysisResponse(raw);
}

async function n8nProposal(store, verification, analysis, onStage) {
  onStage?.(0);
  const raw = await n8nApi.generateProposal({ store, verification, analysis });
  const result = normalizeProposalResponse(raw);
  onStage?.(1);
  return result;
}

async function n8nSave(payload) {
  return normalizeSaveResponse(await n8nApi.saveFollowUp(payload));
}

async function n8nHistory() {
  return normalizeHistoryResponse(await n8nApi.history());
}

export const dataClient = {
  loginSession: dataMode === 'n8n'
    ? async (body = {}) => normalizeAuthResponse(await n8nApi.login(body))
    : async () => ({ role: 'KT_SALES_POC', authenticated: true, loggedInAt: new Date().toISOString() }),
  logoutSession: dataMode === 'n8n' ? n8nApi.logout : async () => ({ ok: true }),
  interpretNaturalSearch: dataMode === 'n8n' ? n8nInterpret : mockApi.interpretNaturalSearch,
  searchRestaurants: dataMode === 'n8n' ? n8nSearch : mockApi.searchRestaurants,
  saveVerification: dataMode === 'n8n' ? n8nVerification : mockApi.saveVerification,
  runRuleAnalysis: dataMode === 'n8n' ? n8nAnalysis : (_store, verification) => mockApi.runRuleAnalysis(verification),
  generateProposal: dataMode === 'n8n' ? n8nProposal : mockApi.generateProposal,
  saveFollowUp: dataMode === 'n8n' ? n8nSave : mockApi.saveFollowUp,
  fetchHistory: dataMode === 'n8n' ? n8nHistory : mockApi.fetchHistory,
};
