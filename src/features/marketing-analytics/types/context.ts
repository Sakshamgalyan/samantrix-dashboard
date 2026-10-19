import type React from "react";
import type { MarketingRange } from "@/features/marketing-analytics/types/api";
import type { MarketingAction } from "@/features/marketing-analytics/types/actions";
import type { MarketingPageState } from "@/features/marketing-analytics/types/state";

export interface MarketingContextType {
  state: MarketingPageState;
  dispatch: React.Dispatch<MarketingAction>;

  // Actions
  setRange: (range: MarketingRange) => void;
  setVisitsPage: (page: number) => void;

  // API handlers
  refresh: () => Promise<void>;
}
