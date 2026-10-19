import type { RealtimeMonitorAction } from "./types";
import type { BroadcastPayload } from "../types";

export const setSearchQueryAction = (query: string): RealtimeMonitorAction => ({
  type: "SET_SEARCH_QUERY",
  payload: query,
});

export const setRoomFilterAction = (
  filter: "ALL" | "office" | "org" | "conversation" | "meeting",
): RealtimeMonitorAction => ({
  type: "SET_ROOM_FILTER",
  payload: filter,
});

export const openBroadcastModalAction = (): RealtimeMonitorAction => ({
  type: "OPEN_BROADCAST_MODAL",
});

export const closeBroadcastModalAction = (): RealtimeMonitorAction => ({
  type: "CLOSE_BROADCAST_MODAL",
});

export const setIsBroadcastingAction = (isBroadcasting: boolean): RealtimeMonitorAction => ({
  type: "SET_IS_BROADCASTING",
  payload: isBroadcasting,
});

export const updateBroadcastFormAction = (
  payload: Partial<BroadcastPayload>,
): RealtimeMonitorAction => ({
  type: "UPDATE_BROADCAST_FORM",
  payload,
});

export const resetBroadcastFormAction = (): RealtimeMonitorAction => ({
  type: "RESET_BROADCAST_FORM",
});

export const toggleAutoRefreshAction = (): RealtimeMonitorAction => ({
  type: "TOGGLE_AUTO_REFRESH",
});
