import type { FeatureDialog, FeatureFlagsOverview } from "./state";

export type FeatureFlagsAction =
  | { type: "LOAD_SUCCESS"; payload: FeatureFlagsOverview }
  | { type: "LOAD_FAILURE"; payload: string }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_DIALOG"; payload: FeatureDialog }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_TOGGLING"; payload: string | null }
  | { type: "SET_IMPORTING"; payload: boolean };
