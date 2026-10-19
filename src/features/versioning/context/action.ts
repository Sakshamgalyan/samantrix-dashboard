import type {
  AppFilter,
  ChannelFilter,
  StatusFilter,
  VersioningAction,
  VersioningDialog,
} from "@/features/versioning/types";

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

export const setSearch = (search: string): VersioningAction => ({
  type: "SET_SEARCH",
  payload: search,
});

export const setPage = (page: number): VersioningAction => ({
  type: "SET_PAGE",
  payload: page,
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
