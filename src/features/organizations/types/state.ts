import type { PaginationMeta } from "@/features/common/pagination";
import type {
  AdminOrganization,
  AdminOrganizationDetail,
  AdminOrganizationsSummary,
  OrgPlanTier,
  SettableOrgStatus,
  SubscriptionPlan,
} from "@/features/organizations/types/api";

/** Status filter: ALL, a single status, or TRIAL (TRIAL + TRIALING). */
export type StatusTab =
  "ALL" | "ACTIVE" | "TRIAL" | "PENDING" | "SUSPENDED" | "CANCELLED";

export type PlanFilter = "ALL" | OrgPlanTier;

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

/** Create (no org) or edit (org detail loaded first so every field is prefilled). */
export interface FormDialogState {
  mode: "create" | "edit";
  org: AdminOrganizationDetail | null;
}

/** UI-only state kept in the reducer; server data lives in the RTK Query cache. */
export interface OrganizationsUiState {
  refreshing: boolean;
  tab: StatusTab;
  plan: PlanFilter;
  /** What is typed in the search box. */
  search: string;
  /** The search sent to the server (applied after a short pause). */
  appliedSearch: string;
  /** Page of the organizations table. */
  page: number;
  /** Organization whose detail dialog is open. */
  detailOrgId: string | null;
  statusDialog: StatusDialogState | null;
  formDialog: FormDialogState | null;
  /** Organization getting a subscription assigned. */
  subscriptionDialog: AdminOrganization | null;
  deleteDialog: AdminOrganization | null;
}

/** What components read: the UI state composed with the cached queries. */
export interface OrganizationsState {
  /** Counts for the chips and KPI cards (null until the first load). */
  summary: AdminOrganizationsSummary | null;
  /** Error of the summary query, shown only while there is no summary. */
  error: string | null;
  /** Rows of the current table page (filtered on the server). */
  rows: AdminOrganization[];
  meta: PaginationMeta | null;
  /** True while a page/filter loads and there is nothing to show yet. */
  listLoading: boolean;
  refreshing: boolean;
  tab: StatusTab;
  plan: PlanFilter;
  search: string;
  appliedSearch: string;
  page: number;
  detail: DetailState | null;
  statusDialog: StatusDialogState | null;
  formDialog: FormDialogState | null;
  /** Organization getting a subscription assigned. */
  subscriptionDialog: AdminOrganization | null;
  deleteDialog: AdminOrganization | null;
  /** Plan price list for the subscription form (null while it loads). */
  plans: SubscriptionPlan[] | null;
}
