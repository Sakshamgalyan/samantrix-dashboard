import type { MarketingAction, MarketingRange } from "@/features/marketing-analytics/types";

export const setRange = (range: MarketingRange): MarketingAction => ({
  type: "SET_RANGE",
  payload: range,
});

export const setRefreshing = (refreshing: boolean): MarketingAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const setVisitsPage = (page: number): MarketingAction => ({
  type: "SET_VISITS_PAGE",
  payload: page,
});
