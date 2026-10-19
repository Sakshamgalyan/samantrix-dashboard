import type {
  AdminOrganization,
  FormDialogState,
  OrganizationsAction,
  PlanFilter,
  SettableOrgStatus,
  StatusTab,
} from "@/features/organizations/types";

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

export const applySearch = (search: string): OrganizationsAction => ({
  type: "APPLY_SEARCH",
  payload: search,
});

export const setPage = (page: number): OrganizationsAction => ({
  type: "SET_PAGE",
  payload: page,
});

export const openDetail = (orgId: string): OrganizationsAction => ({
  type: "OPEN_DETAIL",
  payload: orgId,
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

export const setPlan = (plan: PlanFilter): OrganizationsAction => ({
  type: "SET_PLAN",
  payload: plan,
});

export const setFormDialog = (
  dialog: FormDialogState | null,
): OrganizationsAction => ({ type: "SET_FORM_DIALOG", payload: dialog });

export const setSubscriptionDialog = (
  org: AdminOrganization | null,
): OrganizationsAction => ({ type: "SET_SUBSCRIPTION_DIALOG", payload: org });

export const setDeleteDialog = (
  org: AdminOrganization | null,
): OrganizationsAction => ({ type: "SET_DELETE_DIALOG", payload: org });
