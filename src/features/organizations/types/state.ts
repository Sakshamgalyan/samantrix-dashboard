import type {
  AdminOrganization,
  AdminOrganizationDetail,
  AdminOrganizationsResponse,
  SettableOrgStatus,
} from "./api";

/** Status tab filter: ALL, a single status, or TRIAL (TRIAL + TRIALING). */
export type StatusTab =
  "ALL" | "ACTIVE" | "TRIAL" | "PENDING" | "SUSPENDED" | "CANCELLED";

export interface DetailState {
  orgId: string;
  data: AdminOrganizationDetail | null;
  loading: boolean;
  error: string | null;
}

export interface StatusDialogState {
  org: AdminOrganization;
  target: SettableOrgStatus;
  reason: string;
  submitting: boolean;
}

export interface OrganizationsState {
  data: AdminOrganizationsResponse | null;
  /** Error of the last list load (first load or background refresh). */
  error: string | null;
  refreshing: boolean;
  tab: StatusTab;
  search: string;
  detail: DetailState | null;
  statusDialog: StatusDialogState | null;
}
