import { ALL_CATEGORIES } from "@/features/feature-flags/common/constants";
import type { FeatureFlagsAction, FeatureFlagsUiState } from "@/features/feature-flags/types";

export const initialFeatureFlagsState: FeatureFlagsUiState = {
  refreshing: false,
  category: ALL_CATEGORIES,
  search: "",
  dialog: null,
  submitting: false,
  togglingKey: null,
  importing: false,
};

/** UI state only: the catalog comes from the RTK Query cache. */
export const featureFlagsReducer = (
  state: FeatureFlagsUiState,
  action: FeatureFlagsAction,
): FeatureFlagsUiState => {
  switch (action.type) {
    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "SET_CATEGORY":
      return { ...state, category: action.payload };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "SET_DIALOG":
      return { ...state, dialog: action.payload };

    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };

    case "SET_TOGGLING":
      return { ...state, togglingKey: action.payload };

    case "SET_IMPORTING":
      return { ...state, importing: action.payload };

    default:
      return state;
  }
}
