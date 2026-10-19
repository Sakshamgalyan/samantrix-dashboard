import type { DepartmentMember } from "./api";

export type DepartmentsAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SELECTED_DEPARTMENT"; payload: string | null }
  | { type: "OPEN_REASSIGN_MODAL"; payload: DepartmentMember }
  | { type: "CLOSE_REASSIGN_MODAL" }
  | { type: "SET_FORM_DEPARTMENT"; payload: string }
  | { type: "SET_FORM_JOB_TITLE"; payload: string }
  | { type: "SET_IS_SAVING"; payload: boolean }
  | { type: "SET_ACTION_ERROR"; payload: string | null }
  | { type: "RESET_FILTERS" };
