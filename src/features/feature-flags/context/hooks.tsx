import { useContext } from "react";
import { FeatureFlagsContext } from "@/features/feature-flags/context/index";
import type { FeatureFlagsContextType } from "@/features/feature-flags/types";

export const useFeatureFlagsContext = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlagsContext must be used within a FeatureFlagsProvider",
    );
  }
  return context;
}
