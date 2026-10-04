import type {
  MarketingAction,
  MarketingRange,
  MarketingReport,
  VisitorsResponse,
} from "../types";

export const setRange = (range: MarketingRange): MarketingAction => ({
  type: "SET_RANGE",
  payload: range,
});

export const setRefreshing = (refreshing: boolean): MarketingAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const reportSuccess = (report: MarketingReport): MarketingAction => ({
  type: "REPORT_SUCCESS",
  payload: report,
});

export const reportFailure = (error: string): MarketingAction => ({
  type: "REPORT_FAILURE",
  payload: error,
});

export const setVisitsPage = (page: number): MarketingAction => ({
  type: "SET_VISITS_PAGE",
  payload: page,
});

export const visitsLoading = (): MarketingAction => ({
  type: "VISITS_LOADING",
});

export const visitsSuccess = (visits: VisitorsResponse): MarketingAction => ({
  type: "VISITS_SUCCESS",
  payload: visits,
});

export const visitsFailure = (error: string): MarketingAction => ({
  type: "VISITS_FAILURE",
  payload: error,
});
