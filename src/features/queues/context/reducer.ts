import type { QueuesAction, QueuesState } from "@/features/queues/context/types";

export const initialQueuesState: QueuesState = {
  selectedQueue: null,
  autoRefresh: true,
  refreshIntervalSec: 10,
};

export const queuesReducer = (
  state: QueuesState,
  action: QueuesAction,
): QueuesState => {
  switch (action.type) {
    case "SET_SELECTED_QUEUE":
      return { ...state, selectedQueue: action.payload };

    case "TOGGLE_AUTO_REFRESH":
      return { ...state, autoRefresh: !state.autoRefresh };

    case "SET_REFRESH_INTERVAL":
      return { ...state, refreshIntervalSec: action.payload };

    default:
      return state;
  }
}
