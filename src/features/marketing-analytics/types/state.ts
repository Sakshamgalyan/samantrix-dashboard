import type { MarketingRange, MarketingReport, VisitorsResponse } from "./api";

export interface MarketingPageState {
  range: MarketingRange;
  report: MarketingReport | null;
  /** Report load error (banner over stale data, or the full-page error on first load). */
  error: string | null;
  refreshing: boolean;

  visits: VisitorsResponse | null;
  visitsPage: number;
  visitsLoading: boolean;
  visitsError: string | null;
}
