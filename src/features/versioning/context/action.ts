import type {
  AppFilter,
  ChannelFilter,
  Release,
  StatusFilter,
  VersioningAction,
  VersioningDialog,
  VersioningSummary,
} from "../types";

export const loadSuccess = (
  releases: Release[],
  summary: VersioningSummary,
): VersioningAction => ({
  type: "LOAD_SUCCESS",
  payload: { releases, summary },
});

export const loadFailure = (message: string): VersioningAction => ({
  type: "LOAD_FAILURE",
  payload: message,
});

export const setRefreshing = (refreshing: boolean): VersioningAction => ({
  type: "SET_REFRESHING",
  payload: refreshing,
});

export const setAppFilter = (filter: AppFilter): VersioningAction => ({
  type: "SET_APP_FILTER",
  payload: filter,
});

export const setChannelFilter = (filter: ChannelFilter): VersioningAction => ({
  type: "SET_CHANNEL_FILTER",
  payload: filter,
});

export const setStatusFilter = (filter: StatusFilter): VersioningAction => ({
  type: "SET_STATUS_FILTER",
  payload: filter,
});

export const openDialog = (dialog: VersioningDialog): VersioningAction => ({
  type: "OPEN_DIALOG",
  payload: dialog,
});

export const closeDialog = (): VersioningAction => ({ type: "CLOSE_DIALOG" });

export const setRolloutPercent = (percent: number): VersioningAction => ({
  type: "SET_ROLLOUT_PERCENT",
  payload: percent,
});

export const setSubmitting = (submitting: boolean): VersioningAction => ({
  type: "SET_SUBMITTING",
  payload: submitting,
});
