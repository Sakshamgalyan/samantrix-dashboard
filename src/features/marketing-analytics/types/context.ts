import type React from "react";
import type { MarketingRange } from "./api";
import type { MarketingAction } from "./actions";
import type { MarketingPageState } from "./state";

export interface MarketingContextType {
  state: MarketingPageState;
  dispatch: React.Dispatch<MarketingAction>;

  // Actions
  setRange: (range: MarketingRange) => void;
  setVisitsPage: (page: number) => void;

  // API handlers
  refresh: () => Promise<void>;
}
