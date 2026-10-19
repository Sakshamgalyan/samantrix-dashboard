import type { Dispatch } from "react";
import type { AnalyticsState } from "@/features/analytics/types/state";
import type { AnalyticsAction } from "@/features/analytics/types/actions";

export interface AnalyticsContextValue {
  state: AnalyticsState;
  dispatch: Dispatch<AnalyticsAction>;
}
