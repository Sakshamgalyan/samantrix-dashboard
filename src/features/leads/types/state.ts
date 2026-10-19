import type { PaginationMeta } from "@/features/common/pagination";
import type {
  Assignee,
  LeadActivity,
  LeadDetail,
  LeadListItem,
  LeadStatus,
  LeadType,
  LeadsSummary,
  PricePlan,
  WaitlistEntry,
  WaitlistStatus,
} from "@/features/leads/types/api";

/** Top-level tabs: the sales pipeline or the early-access waitlist. */
export type LeadsTab = "pipeline" | "waitlist";

/** Pipeline quick views (status chips above the list). */
export type PipelineView = "OPEN" | "FOLLOW_UP_DUE" | "ALL" | LeadStatus;

export type TypeFilter = LeadType | "ALL";
/** Developer id, "UNASSIGNED" or "ALL". */
export type AssigneeFilter = string;

export interface LeadsFilters {
  view: PipelineView;
  type: TypeFilter;
  assignee: AssigneeFilter;
  /** Applied (debounced) search term sent to the backend. */
  search: string;
  page: number;
}

/** Server-side filters of the waitlist queue. */
export interface WaitlistFilters {
  status: WaitlistStatus | "ALL";
  /** Applied (debounced) search term sent to the backend. */
  search: string;
  page: number;
}

export interface LeadDetailState {
  id: string;
  lead: LeadDetail | null;
  loading: boolean;
  error: string | null;
}

/** One page of the open lead's timeline. */
export interface LeadTimelineState {
  items: LeadActivity[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

/** Which form is open in the detail drawer. */
export type DetailDialog = "email" | "quote" | "delete" | null;

/** Page UI state held in the reducer; server data comes from the RTK Query cache. */
export interface LeadsUiState {
  tab: LeadsTab;
  refreshing: boolean;

  filters: LeadsFilters;
  /** What the user is typing; copied into filters.search after a short pause. */
  searchInput: string;

  waitlistFilters: WaitlistFilters;
  /** What the user is typing in the waitlist search; applied after a short pause. */
  waitlistSearchInput: string;
  selectedWaitlistIds: string[];

  /** Id of the lead open in the drawer. */
  detailId: string | null;
  /** Page of the open lead's timeline. */
  timelinePage: number;
  dialog: DetailDialog;
  /** A mutation on the open lead is in flight (disables its controls). */
  saving: boolean;
}

/** What components read: the UI state plus the cached server data. */
export interface LeadsPageState extends LeadsUiState {
  summary: LeadsSummary | null;
  items: LeadListItem[];
  meta: PaginationMeta | null;
  listLoading: boolean;
  listError: string | null;

  assignees: Assignee[];
  plans: PricePlan[];

  waitlist: WaitlistEntry[];
  waitlistMeta: PaginationMeta | null;
  waitlistLoading: boolean;
  waitlistError: string | null;

  detail: LeadDetailState | null;
  timeline: LeadTimelineState;
}
