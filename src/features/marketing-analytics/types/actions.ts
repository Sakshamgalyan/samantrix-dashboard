import type { MarketingRange } from "@/features/marketing-analytics/types/api";

export type MarketingAction =
  | { type: "SET_RANGE"; payload: MarketingRange }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_VISITS_PAGE"; payload: number };
