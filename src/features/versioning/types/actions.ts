import type { Release, VersioningSummary } from "./api";
import type {
  AppFilter,
  ChannelFilter,
  StatusFilter,
  VersioningDialog,
} from "./state";

export type VersioningAction =
  | {
      type: "LOAD_SUCCESS";
      payload: { releases: Release[]; summary: VersioningSummary };
    }
  | { type: "LOAD_FAILURE"; payload: string }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_APP_FILTER"; payload: AppFilter }
  | { type: "SET_CHANNEL_FILTER"; payload: ChannelFilter }
  | { type: "SET_STATUS_FILTER"; payload: StatusFilter }
  | { type: "OPEN_DIALOG"; payload: VersioningDialog }
  | { type: "CLOSE_DIALOG" }
  | { type: "SET_ROLLOUT_PERCENT"; payload: number }
  | { type: "SET_SUBMITTING"; payload: boolean };
