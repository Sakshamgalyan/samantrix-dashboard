import type { FeaturesAction } from "@/features/features/types/actions";
import type { FeatureStatusFilter } from "@/features/features/types/state";

export const setTogglingKeyAction = (payload: string | null): FeaturesAction => ({
  type: "SET_TOGGLING_KEY",
  payload,
});

export const setActionErrorAction = (payload: string | null): FeaturesAction => ({
  type: "SET_ACTION_ERROR",
  payload,
});

export const setSearchQueryAction = (payload: string): FeaturesAction => ({
  type: "SET_SEARCH_QUERY",
  payload,
});

export const setCategoryFilterAction = (payload: string): FeaturesAction => ({
  type: "SET_CATEGORY_FILTER",
  payload,
});

export const setStatusFilterAction = (payload: FeatureStatusFilter): FeaturesAction => ({
  type: "SET_STATUS_FILTER",
  payload,
});

export const resetFiltersAction = (): FeaturesAction => ({
  type: "RESET_FILTERS",
});
