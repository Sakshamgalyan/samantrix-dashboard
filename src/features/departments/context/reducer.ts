import type { DepartmentsState } from "../types/state";
import type { DepartmentsAction } from "../types/actions";

export function departmentsReducer(
  state: DepartmentsState,
  action: DepartmentsAction,
): DepartmentsState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_SELECTED_DEPARTMENT":
      return { ...state, selectedDepartment: action.payload };

    case "OPEN_REASSIGN_MODAL":
      return {
        ...state,
        editingMember: action.payload,
        formDepartment: action.payload.jobTitle
          ? state.formDepartment
          : "",
        formJobTitle: action.payload.jobTitle || "",
        actionError: null,
      };

    case "CLOSE_REASSIGN_MODAL":
      return {
        ...state,
        editingMember: null,
        actionError: null,
      };

    case "SET_FORM_DEPARTMENT":
      return { ...state, formDepartment: action.payload };

    case "SET_FORM_JOB_TITLE":
      return { ...state, formJobTitle: action.payload };

    case "SET_IS_SAVING":
      return { ...state, isSaving: action.payload };

    case "SET_ACTION_ERROR":
      return { ...state, actionError: action.payload };

    case "RESET_FILTERS":
      return {
        ...state,
        searchQuery: "",
        selectedDepartment: null,
      };

    default:
      return state;
  }
}
