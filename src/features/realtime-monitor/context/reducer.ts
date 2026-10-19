import type { RealtimeMonitorAction, RealtimeMonitorState } from "@/features/realtime-monitor/context/types";

export const initialRealtimeMonitorState: RealtimeMonitorState = {
  searchQuery: "",
  roomFilter: "ALL",
  isBroadcastModalOpen: false,
  isBroadcasting: false,
  broadcastForm: {
    title: "",
    message: "",
    severity: "info",
    organizationId: "",
  },
  autoRefresh: true,
};

export const realtimeMonitorReducer = (
  state: RealtimeMonitorState,
  action: RealtimeMonitorAction,
): RealtimeMonitorState => {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_ROOM_FILTER":
      return { ...state, roomFilter: action.payload };

    case "OPEN_BROADCAST_MODAL":
      return { ...state, isBroadcastModalOpen: true };

    case "CLOSE_BROADCAST_MODAL":
      return { ...state, isBroadcastModalOpen: false };

    case "SET_IS_BROADCASTING":
      return { ...state, isBroadcasting: action.payload };

    case "UPDATE_BROADCAST_FORM":
      return {
        ...state,
        broadcastForm: { ...state.broadcastForm, ...action.payload },
      };

    case "RESET_BROADCAST_FORM":
      return {
        ...state,
        broadcastForm: {
          title: "",
          message: "",
          severity: "info",
          organizationId: "",
        },
      };

    case "TOGGLE_AUTO_REFRESH":
      return { ...state, autoRefresh: !state.autoRefresh };

    default:
      return state;
  }
}
