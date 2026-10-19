import type { QueuesAction } from "./types";

export const setSelectedQueueAction = (queue: string | null): QueuesAction => ({
  type: "SET_SELECTED_QUEUE",
  payload: queue,
});

export const toggleAutoRefreshAction = (): QueuesAction => ({
  type: "TOGGLE_AUTO_REFRESH",
});

export const setRefreshIntervalAction = (seconds: number): QueuesAction => ({
  type: "SET_REFRESH_INTERVAL",
  payload: seconds,
});
