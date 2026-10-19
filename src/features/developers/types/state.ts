import type { PaginationMeta } from "@/features/common/pagination";
import type {
  DeveloperAccount,
  DeveloperStatus,
  DevelopersSummary,
} from "@/features/developers/types/api";

export type StatusFilter = "ALL" | DeveloperStatus;
export type RoleFilter = "ALL" | string;

/**
 * Dialogs: role-picking (approve, reinstate, role), the edit form, and confirm-only
 * actions (reject, suspend, reactivate, delete).
 */
export type DeveloperDialogKind =
  | "approve"
  | "reinstate"
  | "role"
  | "edit"
  | "reject"
  | "suspend"
  | "reactivate"
  | "delete";

export interface DeveloperDialog {
  kind: DeveloperDialogKind;
  dev: DeveloperAccount;
}

/** Values in the edit / role dialogs. */
export interface DeveloperForm {
  fullName: string;
  phone: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED";
}

/** Page-local UI state (reducer); server data comes from the shared store. */
export interface DevelopersUiState {
  refreshing: boolean;
  statusFilter: StatusFilter;
  roleFilter: RoleFilter;
  /** What is typed in the search box. */
  search: string;
  /** The search sent to the server (applied after a short pause). */
  appliedSearch: string;
  /** Page of the "All developers" table. */
  page: number;
  dialog: DeveloperDialog | null;
  form: DeveloperForm;
  submitting: boolean;
}

/** What consumers read: UI state plus the cached developer queries. */
export interface DevelopersPageState extends DevelopersUiState {
  /** Counts for the KPI cards (null until the first load). */
  summary: DevelopersSummary | null;
  /** Error of the summary query, shown only while there is no summary. */
  error: string | null;
  /** Rows of the current table page (server-filtered). */
  rows: DeveloperAccount[];
  meta: PaginationMeta | null;
  /** True while a page/filter loads and there is nothing to show yet. */
  listLoading: boolean;
}
