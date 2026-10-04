import type { OrganizationsAction, OrganizationsState } from "../types";

export const initialOrganizationsState: OrganizationsState = {
  data: null,
  error: null,
  refreshing: false,
  tab: "ALL",
  search: "",
  detail: null,
  statusDialog: null,
};

export function organizationsReducer(
  state: OrganizationsState,
  action: OrganizationsAction,
): OrganizationsState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, data: action.payload, error: null, refreshing: false };

    case "LOAD_FAILURE":
      return { ...state, error: action.payload, refreshing: false };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "SET_TAB":
      return { ...state, tab: action.payload };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "OPEN_DETAIL":
      return {
        ...state,
        detail: {
          orgId: action.payload,
          data: null,
          loading: true,
          error: null,
        },
      };

    case "DETAIL_SUCCESS":
      // Ignore a late response for a dialog that was closed or switched
      if (state.detail?.orgId !== action.payload.id) return state;
      return {
        ...state,
        detail: {
          ...state.detail,
          data: action.payload,
          loading: false,
          error: null,
        },
      };

    case "DETAIL_FAILURE":
      if (state.detail?.orgId !== action.payload.orgId) return state;
      return {
        ...state,
        detail: {
          ...state.detail,
          loading: false,
          error: action.payload.error,
        },
      };

    case "CLOSE_DETAIL":
      return { ...state, detail: null };

    case "OPEN_STATUS_DIALOG":
      return {
        ...state,
        statusDialog: {
          org: action.payload.org,
          target: action.payload.target,
          reason: "",
          submitting: false,
        },
      };

    case "SET_STATUS_REASON":
      return state.statusDialog
        ? {
            ...state,
            statusDialog: { ...state.statusDialog, reason: action.payload },
          }
        : state;

    case "SET_STATUS_SUBMITTING":
      return state.statusDialog
        ? {
            ...state,
            statusDialog: { ...state.statusDialog, submitting: action.payload },
          }
        : state;

    case "CLOSE_STATUS_DIALOG":
      return { ...state, statusDialog: null };

    default:
      return state;
  }
}
