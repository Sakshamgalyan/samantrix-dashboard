import type React from "react";
import type { ReleaseListItem, VersioningSummary } from "@/features/versioning/types/api";
import type { VersioningAction } from "@/features/versioning/types/actions";
import type { ReleaseFormValues } from "@/features/versioning/types/forms";
import type {
  AppFilter,
  ChannelFilter,
  StatusFilter,
  VersioningDialog,
  VersioningState,
} from "@/features/versioning/types/state";

export interface VersioningContextType {
  state: VersioningState;
  dispatch: React.Dispatch<VersioningAction>;

  /** Rows of the current releases page (app tab and channel / status filters applied on the server). */
  releases: ReleaseListItem[];
  summary: VersioningSummary | null;
  /** Superadmins, managers and members manage releases; auditors read. */
  canManage: boolean;
  /** Deleting a release needs a superadmin or manager. */
  canDelete: boolean;
  /** Release being switched on/off the website from the list. */
  publishingId: string | null;

  // Filters & dialogs
  setAppFilter: (filter: AppFilter) => void;
  setChannelFilter: (filter: ChannelFilter) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  openDialog: (dialog: VersioningDialog) => void;
  closeDialog: () => void;
  setRolloutPercent: (percent: number) => void;

  // API handlers
  /** Refetches releases and summary; a failure keeps the last data on screen. */
  refresh: () => void;
  submitReleaseForm: (values: ReleaseFormValues) => Promise<boolean>;
  confirmAction: () => Promise<void>;
  setShowOnHome: (release: ReleaseListItem, showOnHome: boolean) => Promise<void>;
}
