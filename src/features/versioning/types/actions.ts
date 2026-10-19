import type {
  AppFilter,
  ChannelFilter,
  StatusFilter,
  VersioningDialog,
} from "@/features/versioning/types/state";

export type VersioningAction =
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_APP_FILTER"; payload: AppFilter }
  | { type: "SET_CHANNEL_FILTER"; payload: ChannelFilter }
  | { type: "SET_STATUS_FILTER"; payload: StatusFilter }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "OPEN_DIALOG"; payload: VersioningDialog }
  | { type: "CLOSE_DIALOG" }
  | { type: "SET_ROLLOUT_PERCENT"; payload: number }
  | { type: "SET_SUBMITTING"; payload: boolean };
