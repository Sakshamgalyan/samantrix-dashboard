import type { EcosystemAction, EcosystemState } from "@/features/ecosystem/context/types";

export const initialEcosystemState: EcosystemState = {
  searchQuery: "",
  statusFilter: "ALL",
  selectedService: null,
  isDetailModalOpen: false,
  isAutoRefresh: true,
  autoRefreshIntervalSec: 15,
  isPinging: false,
  pingResults: {},
  lastManualRefreshAt: Date.now(),
};

export const ecosystemReducer = (
  state: EcosystemState,
  action: EcosystemAction,
): EcosystemState => {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload };

    case "OPEN_DETAIL_MODAL":
      return {
        ...state,
        selectedService: action.payload,
        isDetailModalOpen: true,
      };

    case "CLOSE_DETAIL_MODAL":
      return {
        ...state,
        selectedService: null,
        isDetailModalOpen: false,
      };

    case "TOGGLE_AUTO_REFRESH":
      return { ...state, isAutoRefresh: !state.isAutoRefresh };

    case "SET_AUTO_REFRESH_INTERVAL":
      return { ...state, autoRefreshIntervalSec: action.payload };

    case "SET_IS_PINGING":
      return { ...state, isPinging: action.payload };

    case "SET_PING_RESULT":
      return {
        ...state,
        pingResults: {
          ...state.pingResults,
          [action.payload.serviceId]: action.payload.result,
        },
      };

    case "RECORD_MANUAL_REFRESH":
      return { ...state, lastManualRefreshAt: Date.now() };

    default:
      return state;
  }
}
