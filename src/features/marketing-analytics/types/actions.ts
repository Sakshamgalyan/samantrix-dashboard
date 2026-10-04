import type { MarketingRange, MarketingReport, VisitorsResponse } from "./api";

export type MarketingAction =
  | { type: "SET_RANGE"; payload: MarketingRange }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "REPORT_SUCCESS"; payload: MarketingReport }
  | { type: "REPORT_FAILURE"; payload: string }
  | { type: "SET_VISITS_PAGE"; payload: number }
  | { type: "VISITS_LOADING" }
  | { type: "VISITS_SUCCESS"; payload: VisitorsResponse }
  | { type: "VISITS_FAILURE"; payload: string };
