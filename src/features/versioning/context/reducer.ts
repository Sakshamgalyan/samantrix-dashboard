import type { VersioningAction, VersioningState } from "../types";

export const initialVersioningState: VersioningState = {
  releases: [],
  summary: null,
  loaded: false,
  refreshing: false,
  error: null,
  appFilter: "ALL",
  channelFilter: "ALL",
  statusFilter: "ALL",
  dialog: null,
  submitting: false,
};

export function versioningReducer(
  state: VersioningState,
  action: VersioningAction,
): VersioningState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return {
        ...state,
        releases: action.payload.releases,
        summary: action.payload.summary,
        loaded: true,
        refreshing: false,
        error: null,
      };

    case "LOAD_FAILURE":
      return { ...state, error: action.payload, refreshing: false };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "SET_APP_FILTER":
      return { ...state, appFilter: action.payload };

    case "SET_CHANNEL_FILTER":
      return { ...state, channelFilter: action.payload };

    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload };

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
}
