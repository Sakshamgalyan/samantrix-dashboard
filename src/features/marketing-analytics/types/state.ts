import type { MarketingRange, MarketingReport, VisitorsResponse } from "@/features/marketing-analytics/types/api";

/** Page UI state held in the reducer; server data comes from the RTK Query cache. */
export interface MarketingUiState {
  range: MarketingRange;
  /** Manual refresh in flight. */
  refreshing: boolean;
  visitsPage: number;
}

/** What components read: the UI state plus the cached server data. */
export interface MarketingPageState extends MarketingUiState {
  report: MarketingReport | null;
  /** Report load error (banner over stale data, or the full-page error on first load). */
  error: string | null;

  visits: VisitorsResponse | null;
  visitsLoading: boolean;
  visitsError: string | null;
}
