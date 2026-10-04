import { ALL_CATEGORIES } from "../common/constants";
import type { FeatureFlagsAction, FeatureFlagsState } from "../types";

export const initialFeatureFlagsState: FeatureFlagsState = {
  overview: null,
  loadError: null,
  refreshing: false,
  category: ALL_CATEGORIES,
  search: "",
  dialog: null,
  submitting: false,
  togglingKey: null,
  importing: false,
};

export function featureFlagsReducer(
  state: FeatureFlagsState,
  action: FeatureFlagsAction,
): FeatureFlagsState {
  switch (action.type) {
    case "LOAD_SUCCESS": {
      const categories = new Set(
        action.payload.features.map((f) => f.category),
      );
      return {
        ...state,
        overview: action.payload,
        loadError: null,
        refreshing: false,
        // Drop a category tab whose last feature was deleted or moved
        category:
          state.category === ALL_CATEGORIES || categories.has(state.category)
            ? state.category
            : ALL_CATEGORIES,
      };
    }

    case "LOAD_FAILURE":
      return { ...state, loadError: action.payload, refreshing: false };

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
