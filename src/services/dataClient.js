import * as mockApi from "./mockApi.js";
import { n8nApi } from "./n8nApi.js";

export const dataMode = import.meta.env.VITE_DATA_MODE === "n8n" ? "n8n" : "mock";

export const dataClient = {
  interpretNaturalSearch:
    dataMode === "n8n"
      ? (conditions) => n8nApi.interpretNaturalSearch(conditions)
      : mockApi.interpretNaturalSearch,
  searchRestaurants:
    dataMode === "n8n"
      ? (conditions) => n8nApi.searchRestaurants(conditions)
      : mockApi.searchRestaurants,
  saveVerification:
    dataMode === "n8n"
      ? (store, verification) => n8nApi.verifyStore({ storeId: store.storeId, ...verification })
      : async (_store, verification) => verification,
  runRuleAnalysis:
    dataMode === "n8n"
      ? (store, verification) => n8nApi.analyzeProducts({ store, verification })
      : (_store, verification) => mockApi.runRuleAnalysis(verification),
  generateProposal:
    dataMode === "n8n"
      ? (store, verification, analysis) => n8nApi.generateProposal({ store, verification, analysis })
      : mockApi.generateProposal,
  saveFollowUp:
    dataMode === "n8n"
      ? (payload) => n8nApi.saveFollowUp(payload)
      : mockApi.saveFollowUp,
  fetchHistory: dataMode === "n8n" ? n8nApi.history : mockApi.fetchHistory,
};
