import type { Paginated } from "@/features/common/pagination";
import type {
  ReleaseApp,
  ReleaseChannel,
  ReleaseListItem,
  ReleaseStatus,
  VersioningSummary,
} from "@/features/versioning/types/api";

/**
 * Which dialog is open. Dialogs carry the table row they act on; the edit dialog loads the
 * full release (notes, changes, download link) itself.
 */
export type VersioningDialog =
  | { kind: "create"; defaultApp?: ReleaseApp }
  | { kind: "edit"; release: ReleaseListItem }
  | { kind: "rollout"; release: ReleaseListItem; percent: number }
  | { kind: "release"; release: ReleaseListItem }
  | { kind: "rollback"; release: ReleaseListItem }
  | { kind: "delete"; release: ReleaseListItem };

export type AppFilter = "ALL" | ReleaseApp;
export type ChannelFilter = "ALL" | ReleaseChannel;
export type StatusFilter = "ALL" | ReleaseStatus;

/** UI-only state kept in the reducer; releases and summary live in the RTK Query cache. */
export type VersioningUiState = Omit<
  VersioningState,
  "releases" | "summary" | "loaded" | "error" | "releasesLoading"
>;

/** What components read: the UI state composed with the cached queries. */
export interface VersioningState {
  /** Current page of the releases table (server-side filters and paging). */
  releases: Paginated<ReleaseListItem> | null;
  /** A page or filter change is loading. */
  releasesLoading: boolean;
  summary: VersioningSummary | null;
  /** First load done (successfully). */
  loaded: boolean;
  refreshing: boolean;
  /** Last load error (first-load failure or failed background refresh; last data stays). */
  error: string | null;

  appFilter: AppFilter;
  channelFilter: ChannelFilter;
  statusFilter: StatusFilter;
  search: string;
  /** Releases table page (1-based); filter changes reset it. */
  page: number;

  dialog: VersioningDialog | null;
  submitting: boolean;
}
