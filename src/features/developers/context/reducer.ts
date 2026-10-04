import type { DevelopersAction, DevelopersPageState } from "../types";

export const initialDevelopersState: DevelopersPageState = {
  data: null,
  error: null,
  refreshing: false,
  tab: "ALL",
  search: "",
  dialog: null,
  selectedRole: "USER",
  submitting: false,
};

export function developersReducer(
  state: DevelopersPageState,
  action: DevelopersAction,
): DevelopersPageState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, data: action.payload, error: null, refreshing: false };

    case "LOAD_FAILURE":
      // Keep the last good data on screen; the error shows as a banner over it
      return { ...state, error: action.payload, refreshing: false };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "SET_TAB":
      return { ...state, tab: action.payload };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "OPEN_DIALOG":
      return {
        ...state,
        dialog: action.payload.dialog,
        selectedRole: action.payload.role,
      };

    case "CLOSE_DIALOG":
      return state.submitting ? state : { ...state, dialog: null };

    case "SET_ROLE":
      return { ...state, selectedRole: action.payload };

    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };

    default:
      return state;
  }
}
