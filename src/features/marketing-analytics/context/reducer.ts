import type { MarketingAction, MarketingUiState } from "@/features/marketing-analytics/types";

export const initialMarketingState: MarketingUiState = {
  range: 30,
  refreshing: false,
  visitsPage: 1,
};

export const marketingReducer = (
  state: MarketingUiState,
  action: MarketingAction,
): MarketingUiState => {
  switch (action.type) {
    case "SET_RANGE":
      return action.payload === state.range ? state : { ...state, range: action.payload };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "SET_VISITS_PAGE":
      return { ...state, visitsPage: action.payload };

    default:
      return state;
  }
};
