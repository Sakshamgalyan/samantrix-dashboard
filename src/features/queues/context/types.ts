import type { Dispatch } from "react";

export interface QueuesState {
  selectedQueue: string | null;
  autoRefresh: boolean;
  refreshIntervalSec: number;
}

export type QueuesAction =
  | { type: "SET_SELECTED_QUEUE"; payload: string | null }
  | { type: "TOGGLE_AUTO_REFRESH" }
  | { type: "SET_REFRESH_INTERVAL"; payload: number };

export interface QueuesContextValue {
  state: QueuesState;
  dispatch: Dispatch<QueuesAction>;
}
