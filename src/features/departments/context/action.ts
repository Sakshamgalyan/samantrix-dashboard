import type { DepartmentMember } from "../types/api";
import type { DepartmentsAction } from "../types/actions";

export const setSearchQueryAction = (query: string): DepartmentsAction => ({
  type: "SET_SEARCH_QUERY",
  payload: query,
});

export const setSelectedDepartmentAction = (
  dept: string | null,
): DepartmentsAction => ({
  type: "SET_SELECTED_DEPARTMENT",
  payload: dept,
});

export const openReassignModalAction = (
  member: DepartmentMember,
): DepartmentsAction => ({
  type: "OPEN_REASSIGN_MODAL",
  payload: member,
});

export const closeReassignModalAction = (): DepartmentsAction => ({
  type: "CLOSE_REASSIGN_MODAL",
});

export const setFormDepartmentAction = (dept: string): DepartmentsAction => ({
  type: "SET_FORM_DEPARTMENT",
  payload: dept,
});

export const setFormJobTitleAction = (title: string): DepartmentsAction => ({
  type: "SET_FORM_JOB_TITLE",
  payload: title,
});

export const setIsSavingAction = (isSaving: boolean): DepartmentsAction => ({
  type: "SET_IS_SAVING",
  payload: isSaving,
});

export const setActionErrorAction = (
  error: string | null,
): DepartmentsAction => ({
  type: "SET_ACTION_ERROR",
  payload: error,
});

export const resetFiltersAction = (): DepartmentsAction => ({
  type: "RESET_FILTERS",
});
