import type {
  LeadDetail,
  LeadListItem,
  LeadStatus,
  LeadType,
  LeadsSummary,
  PaginationMeta,
} from "./api";

export type TypeFilter = LeadType | "ALL";
export type StatusFilter = LeadStatus | "ALL";

export interface LeadsFilters {
  type: TypeFilter;
  status: StatusFilter;
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

export interface LeadsPageState {
  summary: LeadsSummary | null;
  /** Error of the latest summary load (stale data stays visible). */
  summaryError: string | null;
  items: LeadListItem[];
  meta: PaginationMeta | null;
  listLoading: boolean;
  listError: string | null;
  refreshing: boolean;
  updatedAt: string | null;

  filters: LeadsFilters;
  /** What the user is typing; copied into filters.search after a short pause. */
  searchInput: string;

  /** Waitlist rows picked for a batch invite. */
  selectedIds: string[];
  inviteDialogOpen: boolean;
  inviting: boolean;

  detail: LeadDetailState | null;
  statusUpdatingId: string | null;
  noteSubmitting: boolean;
}
