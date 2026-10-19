import type { OrganizationsAction, OrganizationsUiState } from "@/features/organizations/types";

export const initialOrganizationsState: OrganizationsUiState = {
  refreshing: false,
  tab: "ALL",
  plan: "ALL",
  search: "",
  appliedSearch: "",
  page: 1,
  detailOrgId: null,
  statusDialog: null,
  formDialog: null,
  subscriptionDialog: null,
  deleteDialog: null,
};

/** UI state only: the list, detail and plans come from the RTK Query cache. */
export function organizationsReducer(
  state: OrganizationsUiState,
  action: OrganizationsAction,
): OrganizationsUiState {
  switch (action.type) {
    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    // A filter change starts again from the first page
    case "SET_TAB":
      return { ...state, tab: action.payload, page: 1 };

    case "SET_PLAN":
      return { ...state, plan: action.payload, page: 1 };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "APPLY_SEARCH":
      return action.payload === state.appliedSearch
        ? state
        : { ...state, appliedSearch: action.payload, page: 1 };

    case "SET_PAGE":
      return { ...state, page: action.payload };

    case "OPEN_DETAIL":
      return { ...state, detailOrgId: action.payload };

    case "CLOSE_DETAIL":
      return { ...state, detailOrgId: null };

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

    case "SET_FORM_DIALOG":
      return { ...state, formDialog: action.payload };

    case "SET_SUBSCRIPTION_DIALOG":
      return { ...state, subscriptionDialog: action.payload };

    case "SET_DELETE_DIALOG":
      return { ...state, deleteDialog: action.payload };

    default:
      return state;
  }
}
