import type {
  Release,
  ReleaseApp,
  ReleaseChannel,
  ReleaseStatus,
  VersioningSummary,
} from "./api";

/** Which dialog is open. Action dialogs carry the release they act on. */
export type VersioningDialog =
  | { kind: "create" }
  | { kind: "edit"; release: Release }
  | { kind: "rollout"; release: Release; percent: number }
  | { kind: "release"; release: Release }
  | { kind: "rollback"; release: Release }
  | { kind: "delete"; release: Release };

export type AppFilter = "ALL" | ReleaseApp;
export type ChannelFilter = "ALL" | ReleaseChannel;
export type StatusFilter = "ALL" | ReleaseStatus;

export interface VersioningState {
  releases: Release[];
  summary: VersioningSummary | null;
  /** First load done (successfully). */
  loaded: boolean;
  refreshing: boolean;
  /** Last load error (first-load failure or failed background refresh). */
  error: string | null;

  appFilter: AppFilter;
  channelFilter: ChannelFilter;
  statusFilter: StatusFilter;

  dialog: VersioningDialog | null;
  submitting: boolean;
}
