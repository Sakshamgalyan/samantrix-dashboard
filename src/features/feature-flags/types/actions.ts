import type { FeatureDialog } from "@/features/feature-flags/types/state";

export type FeatureFlagsAction =
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_DIALOG"; payload: FeatureDialog }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_TOGGLING"; payload: string | null }
  | { type: "SET_IMPORTING"; payload: boolean };
