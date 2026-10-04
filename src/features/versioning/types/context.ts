import type React from "react";
import type { Release, VersioningSummary } from "./api";
import type { VersioningAction } from "./actions";
import type { ReleaseFormValues } from "./forms";
import type {
  AppFilter,
  ChannelFilter,
  StatusFilter,
  VersioningDialog,
  VersioningState,
} from "./state";

export interface VersioningContextType {
  state: VersioningState;
  dispatch: React.Dispatch<VersioningAction>;

  releases: Release[];
  /** Releases after the app tab and channel / status filters. */
  visibleReleases: Release[];
  summary: VersioningSummary | null;
  /** Only SUPERADMIN / PLATFORM_ADMIN can change releases (REPORT_ADMIN reads). */
  canManage: boolean;

  // Filters & dialogs
  setAppFilter: (filter: AppFilter) => void;
  setChannelFilter: (filter: ChannelFilter) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  openDialog: (dialog: VersioningDialog) => void;
  closeDialog: () => void;
  setRolloutPercent: (percent: number) => void;

  // API handlers
  load: () => Promise<void>;
  refresh: () => void;
  submitReleaseForm: (values: ReleaseFormValues) => Promise<boolean>;
  confirmAction: () => Promise<void>;
}
