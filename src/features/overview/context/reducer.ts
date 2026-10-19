import type { OverviewState, OverviewAction } from "@/features/overview/types";

export const initialOverviewState: OverviewState = {
  searchTerm: "",
  page: 1,
  selectedMember: null,
};

export function overviewReducer(state: OverviewState, action: OverviewAction): OverviewState {
  switch (action.type) {
    case "SET_SEARCH_TERM":
      return {
        ...state,
        searchTerm: action.payload,
        page: 1,
      };
    case "SET_PAGE":
      return {
        ...state,
        page: action.payload,
      };
    case "SET_SELECTED_MEMBER":
      return {
        ...state,
        selectedMember: action.payload,
      };
    default:
      return state;
  }
}
