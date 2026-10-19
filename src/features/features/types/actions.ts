import type { FeatureStatusFilter } from "@/features/features/types/state";

export type FeaturesAction =
  | { type: "SET_TOGGLING_KEY"; payload: string | null }
  | { type: "SET_ACTION_ERROR"; payload: string | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_CATEGORY_FILTER"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: FeatureStatusFilter }
  | { type: "RESET_FILTERS" };
