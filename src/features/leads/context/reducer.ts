import type { LeadsAction, LeadsUiState } from "@/features/leads/types";

export const initialLeadsState: LeadsUiState = {
  tab: "pipeline",
  refreshing: false,
  filters: { view: "OPEN", type: "ALL", assignee: "ALL", search: "", page: 1 },
  searchInput: "",
  waitlistFilters: { status: "ALL", search: "", page: 1 },
  waitlistSearchInput: "",
  selectedWaitlistIds: [],
  detailId: null,
  timelinePage: 1,
  dialog: null,
  saving: false,
};

export const leadsReducer = (state: LeadsUiState, action: LeadsAction): LeadsUiState => {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, tab: action.payload };
    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload, page: 1 } };
    case "APPLY_SEARCH":
      if (action.payload === state.filters.search) return state;
      return { ...state, filters: { ...state.filters, search: action.payload, page: 1 } };
    case "SET_SEARCH_INPUT":
      return { ...state, searchInput: action.payload };
    case "SET_PAGE":
      return { ...state, filters: { ...state.filters, page: action.payload } };
    // Any waitlist filter change goes back to page 1 and drops the selection
    case "SET_WAITLIST_STATUS":
      return {
        ...state,
        waitlistFilters: { ...state.waitlistFilters, status: action.payload, page: 1 },
        selectedWaitlistIds: [],
      };
    case "APPLY_WAITLIST_SEARCH":
      if (action.payload === state.waitlistFilters.search) return state;
      return {
        ...state,
        waitlistFilters: { ...state.waitlistFilters, search: action.payload, page: 1 },
        selectedWaitlistIds: [],
      };
    case "SET_WAITLIST_SEARCH_INPUT":
      return { ...state, waitlistSearchInput: action.payload };
    case "SET_WAITLIST_PAGE":
      return {
        ...state,
        waitlistFilters: { ...state.waitlistFilters, page: action.payload },
        selectedWaitlistIds: [],
      };
    case "SET_WAITLIST_SELECTION":
      return { ...state, selectedWaitlistIds: action.payload };
    case "OPEN_DETAIL":
      return { ...state, detailId: action.payload, timelinePage: 1, dialog: null };
    case "CLOSE_DETAIL":
      return { ...state, detailId: null, timelinePage: 1, dialog: null, saving: false };
    case "SET_TIMELINE_PAGE":
      return { ...state, timelinePage: action.payload };
    case "SET_DIALOG":
      return { ...state, dialog: action.payload };
    case "SET_SAVING":
      return { ...state, saving: action.payload };
    default:
      return state;
  }
}
