import type { DepartmentMember } from "./api";

export interface DepartmentsState {
  searchQuery: string;
  selectedDepartment: string | null;
  editingMember: DepartmentMember | null;
  formDepartment: string;
  formJobTitle: string;
  isSaving: boolean;
  actionError: string | null;
}

export const INITIAL_DEPARTMENTS_STATE: DepartmentsState = {
  searchQuery: "",
  selectedDepartment: null,
  editingMember: null,
  formDepartment: "",
  formJobTitle: "",
  isSaving: false,
  actionError: null,
};
