import type { Dispatch } from "react";
import type { BroadcastPayload } from "../types";

export interface RealtimeMonitorState {
  searchQuery: string;
  roomFilter: "ALL" | "office" | "org" | "conversation" | "meeting";
  isBroadcastModalOpen: boolean;
  isBroadcasting: boolean;
  broadcastForm: BroadcastPayload;
  autoRefresh: boolean;
}

export type RealtimeMonitorAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_ROOM_FILTER"; payload: "ALL" | "office" | "org" | "conversation" | "meeting" }
  | { type: "OPEN_BROADCAST_MODAL" }
  | { type: "CLOSE_BROADCAST_MODAL" }
  | { type: "SET_IS_BROADCASTING"; payload: boolean }
  | { type: "UPDATE_BROADCAST_FORM"; payload: Partial<BroadcastPayload> }
  | { type: "RESET_BROADCAST_FORM" }
  | { type: "TOGGLE_AUTO_REFRESH" };

export interface RealtimeMonitorContextValue {
  state: RealtimeMonitorState;
  dispatch: Dispatch<RealtimeMonitorAction>;
}
