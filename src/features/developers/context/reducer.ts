import type { DevelopersAction, DevelopersUiState } from "@/features/developers/types";

export const initialDevelopersState: DevelopersUiState = {
  refreshing: false,
  statusFilter: "ALL",
  roleFilter: "ALL",
  search: "",
  appliedSearch: "",
  page: 1,
  dialog: null,
  form: { fullName: "", phone: "", role: "MEMBER", status: "ACTIVE" },
  submitting: false,
};

export function developersReducer(
  state: DevelopersUiState,
  action: DevelopersAction,
): DevelopersUiState {
  switch (action.type) {
    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    // A filter change starts again from the first page
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload, page: 1 };

    case "SET_ROLE_FILTER":
      return { ...state, roleFilter: action.payload, page: 1 };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "APPLY_SEARCH":
      return action.payload === state.appliedSearch
        ? state
        : { ...state, appliedSearch: action.payload, page: 1 };

    case "SET_PAGE":
      return { ...state, page: action.payload };

    case "OPEN_DIALOG":
      return {
        ...state,
        dialog: action.payload.dialog,
        form: action.payload.form,
      };

    case "CLOSE_DIALOG":
      return state.submitting ? state : { ...state, dialog: null };

    case "PATCH_FORM":
      return { ...state, form: { ...state.form, ...action.payload } };

    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };

    default:
      return state;
  }
}
