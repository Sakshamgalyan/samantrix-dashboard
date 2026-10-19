import type {
  DeveloperDialog,
  DeveloperForm,
  DevelopersAction,
  RoleFilter,
  StatusFilter,
} from "@/features/developers/types";

export const setRefreshing = (refreshing: boolean): DevelopersAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const setStatusFilter = (status: StatusFilter): DevelopersAction => ({
  type: "SET_STATUS_FILTER",
  payload: status,
});

export const setRoleFilter = (role: RoleFilter): DevelopersAction => ({
  type: "SET_ROLE_FILTER",
  payload: role,
});

export const setSearch = (search: string): DevelopersAction => ({
  type: "SET_SEARCH",
  payload: search,
});

export const applySearch = (search: string): DevelopersAction => ({
  type: "APPLY_SEARCH",
  payload: search,
});

export const setPage = (page: number): DevelopersAction => ({
  type: "SET_PAGE",
  payload: page,
});

export const openDialog = (
  dialog: DeveloperDialog,
  form: DeveloperForm,
): DevelopersAction => ({
  type: "OPEN_DIALOG",
  payload: { dialog, form },
});

export const closeDialog = (): DevelopersAction => ({ type: "CLOSE_DIALOG" });

export const patchForm = (patch: Partial<DeveloperForm>): DevelopersAction => ({
  type: "PATCH_FORM",
  payload: patch,
});

export const setSubmitting = (submitting: boolean): DevelopersAction => ({
  type: "SET_SUBMITTING",
  payload: submitting,
});
