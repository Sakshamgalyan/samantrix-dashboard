import type { Dispatch } from "react";
import type { FeaturesState } from "@/features/features/types/state";
import type { FeaturesAction } from "@/features/features/types/actions";

export interface FeaturesContextValue {
  state: FeaturesState;
  dispatch: Dispatch<FeaturesAction>;
}
