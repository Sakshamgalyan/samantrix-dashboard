import type {
  DeveloperDialog,
  DevelopersAction,
  DevelopersResponse,
  DeveloperTab,
} from "../types";

export const loadSuccess = (data: DevelopersResponse): DevelopersAction => ({
  type: "LOAD_SUCCESS",
  payload: data,
});

export const loadFailure = (error: string): DevelopersAction => ({
  type: "LOAD_FAILURE",
  payload: error,
});

export const setRefreshing = (refreshing: boolean): DevelopersAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const setTab = (tab: DeveloperTab): DevelopersAction => ({
  type: "SET_TAB",
  payload: tab,
});

export const setSearch = (search: string): DevelopersAction => ({
  type: "SET_SEARCH",
  payload: search,
});

export const openDialog = (
  dialog: DeveloperDialog,
  role: string,
): DevelopersAction => ({
  type: "OPEN_DIALOG",
  payload: { dialog, role },
});

export const closeDialog = (): DevelopersAction => ({ type: "CLOSE_DIALOG" });

export const setRole = (role: string): DevelopersAction => ({
  type: "SET_ROLE",
  payload: role,
});

export const setSubmitting = (submitting: boolean): DevelopersAction => ({
  type: "SET_SUBMITTING",
  payload: submitting,
});
