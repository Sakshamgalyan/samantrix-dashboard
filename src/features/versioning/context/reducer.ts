import type { VersioningAction, VersioningUiState } from "@/features/versioning/types";

export const initialVersioningState: VersioningUiState = {
  refreshing: false,
  appFilter: "DESKTOP",
  channelFilter: "ALL",
  statusFilter: "ALL",
  search: "",
  page: 1,
  dialog: null,
  submitting: false,
};

/** UI state only: releases and summary come from the RTK Query cache. */
export const versioningReducer = (
  state: VersioningUiState,
  action: VersioningAction,
): VersioningUiState => {
  switch (action.type) {
    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    // A filter change starts again from the first page
    case "SET_APP_FILTER":
      return { ...state, appFilter: action.payload, page: 1 };

    case "SET_CHANNEL_FILTER":
      return { ...state, channelFilter: action.payload, page: 1 };

    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload, page: 1 };

    case "SET_SEARCH":
      return { ...state, search: action.payload, page: 1 };

    case "SET_PAGE":
      return { ...state, page: Math.max(1, action.payload) };

    case "OPEN_DIALOG":
      return { ...state, dialog: action.payload, submitting: false };

    case "CLOSE_DIALOG":
      return state.submitting ? state : { ...state, dialog: null };

    case "SET_ROLLOUT_PERCENT":
      return state.dialog?.kind === "rollout"
        ? { ...state, dialog: { ...state.dialog, percent: action.payload } }
        : state;

    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };

    default:
      return state;
  }
};
