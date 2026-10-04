import type { MarketingAction, MarketingPageState } from "../types";

export const initialMarketingState: MarketingPageState = {
  range: 30,
  report: null,
  error: null,
  refreshing: false,

  visits: null,
  visitsPage: 1,
  visitsLoading: false,
  visitsError: null,
};

export function marketingReducer(
  state: MarketingPageState,
  action: MarketingAction,
): MarketingPageState {
  switch (action.type) {
    case "SET_RANGE":
      // Keep the previous report on screen (with a spinning refresh) until the new range arrives
      return action.payload === state.range
        ? state
        : { ...state, range: action.payload, refreshing: true };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "REPORT_SUCCESS":
      // Ignore a late response for a range the admin has already switched away from
      if (action.payload.range.days !== state.range) return state;
      return {
        ...state,
        report: action.payload,
        error: null,
        refreshing: false,
      };

    case "REPORT_FAILURE":
      // Keep the last good data; the error shows as a banner over it
      return { ...state, error: action.payload, refreshing: false };

    case "SET_VISITS_PAGE":
      return { ...state, visitsPage: action.payload };

    case "VISITS_LOADING":
      return { ...state, visitsLoading: true };

    case "VISITS_SUCCESS":
      if (action.payload.meta.page !== state.visitsPage) return state;
      return {
        ...state,
        visits: action.payload,
        visitsLoading: false,
        visitsError: null,
      };

    case "VISITS_FAILURE":
      return { ...state, visitsLoading: false, visitsError: action.payload };

    default:
      return state;
  }
}
