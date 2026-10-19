import { useContext } from "react";
import { MarketingContext } from "@/features/marketing-analytics/context/index";
import type { MarketingContextType } from "@/features/marketing-analytics/types";

export const useMarketingContext = (): MarketingContextType => {
  const context = useContext(MarketingContext);
  if (!context) {
    throw new Error(
      "useMarketingContext must be used within a MarketingProvider",
    );
  }
  return context;
};
