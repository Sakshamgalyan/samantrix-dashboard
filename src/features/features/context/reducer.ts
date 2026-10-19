import type { FeaturesState } from "@/features/features/types/state";
import type { FeaturesAction } from "@/features/features/types/actions";

export const initialFeaturesState: FeaturesState = {
  togglingKey: null,
  actionError: null,
  searchQuery: "",
  categoryFilter: "ALL",
  statusFilter: "ALL",
};

export const featuresReducer = (state: FeaturesState, action: FeaturesAction): FeaturesState => {
  switch (action.type) {
    case "SET_TOGGLING_KEY":
      return { ...state, togglingKey: action.payload };
    case "SET_ACTION_ERROR":
      return { ...state, actionError: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_CATEGORY_FILTER":
      return { ...state, categoryFilter: action.payload };
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload };
    case "RESET_FILTERS":
      return {
        ...state,
        searchQuery: "",
        categoryFilter: "ALL",
        statusFilter: "ALL",
      };
    default:
      return state;
  }
}
