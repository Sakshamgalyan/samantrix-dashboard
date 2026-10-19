import { FLEET_ACTIONS } from "./actions";
import type { FleetState } from "../types/state";
import type { FleetAction } from "./action";

export function fleetReducer(state: FleetState, action: FleetAction): FleetState {
  switch (action.type) {
    case FLEET_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
        actionError: null,
      };

    case FLEET_ACTIONS.SET_CLIENT_TYPE_FILTER:
      return {
        ...state,
        clientTypeFilter: action.payload,
      };

    case FLEET_ACTIONS.SET_ACTION_ERROR:
      return {
        ...state,
        actionError: action.payload,
      };

    case FLEET_ACTIONS.OPEN_REVOKE_MODAL:
      return {
        ...state,
        revokingSession: action.payload,
        actionError: null,
      };

    case FLEET_ACTIONS.CLOSE_REVOKE_MODAL:
      return {
        ...state,
        revokingSession: null,
        isRevoking: false,
      };

    case FLEET_ACTIONS.SET_IS_REVOKING:
      return {
        ...state,
        isRevoking: action.payload,
      };

    case FLEET_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        searchQuery: "",
        clientTypeFilter: "ALL",
      };

    default:
      return state;
  }
}
