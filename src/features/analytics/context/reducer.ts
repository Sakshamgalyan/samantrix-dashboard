import type { AnalyticsState } from "@/features/analytics/types/state";
import type { AnalyticsAction } from "@/features/analytics/types/actions";

export const initialAnalyticsState: AnalyticsState = {
  timeRange: "30d",
};

export function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case "SET_TIME_RANGE":
      return { ...state, timeRange: action.payload };
    default:
      return state;
  }
}
