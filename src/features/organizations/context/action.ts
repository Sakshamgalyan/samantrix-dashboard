import type {
  AdminOrganization,
  AdminOrganizationDetail,
  AdminOrganizationsResponse,
  OrganizationsAction,
  SettableOrgStatus,
  StatusTab,
} from "../types";

export const loadSuccess = (
  data: AdminOrganizationsResponse,
): OrganizationsAction => ({ type: "LOAD_SUCCESS", payload: data });

export const loadFailure = (error: string): OrganizationsAction => ({
  type: "LOAD_FAILURE",
  payload: error,
});

export const setRefreshing = (refreshing: boolean): OrganizationsAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const setTab = (tab: StatusTab): OrganizationsAction => ({
  type: "SET_TAB",
  payload: tab,
});

export const setSearch = (search: string): OrganizationsAction => ({
  type: "SET_SEARCH",
  payload: search,
});

export const openDetail = (orgId: string): OrganizationsAction => ({
  type: "OPEN_DETAIL",
  payload: orgId,
});

export const detailSuccess = (
  detail: AdminOrganizationDetail,
): OrganizationsAction => ({ type: "DETAIL_SUCCESS", payload: detail });

export const detailFailure = (
  orgId: string,
  error: string,
): OrganizationsAction => ({
  type: "DETAIL_FAILURE",
  payload: { orgId, error },
});

export const closeDetail = (): OrganizationsAction => ({
  type: "CLOSE_DETAIL",
});

export const openStatusDialog = (
  org: AdminOrganization,
  target: SettableOrgStatus,
): OrganizationsAction => ({
  type: "OPEN_STATUS_DIALOG",
  payload: { org, target },
});

export const setStatusReason = (reason: string): OrganizationsAction => ({
  type: "SET_STATUS_REASON",
  payload: reason,
});

export const setStatusSubmitting = (
  submitting: boolean,
): OrganizationsAction => ({
  type: "SET_STATUS_SUBMITTING",
  payload: submitting,
});

export const closeStatusDialog = (): OrganizationsAction => ({
  type: "CLOSE_STATUS_DIALOG",
});
