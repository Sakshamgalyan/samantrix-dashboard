import type { AnalyticsAction } from "@/features/analytics/types/actions";

export const setTimeRangeAction = (payload: string): AnalyticsAction => ({
  type: "SET_TIME_RANGE",
  payload,
});
