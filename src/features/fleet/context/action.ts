import { FLEET_ACTIONS } from "./actions";
import type { ClientFilterType } from "../types/state";
import type { OrgFleetSession } from "../types/api";

export interface SetSearchQueryAction {
  type: typeof FLEET_ACTIONS.SET_SEARCH_QUERY;
  payload: string;
}

export interface SetClientTypeFilterAction {
  type: typeof FLEET_ACTIONS.SET_CLIENT_TYPE_FILTER;
  payload: ClientFilterType;
}

export interface SetActionErrorAction {
  type: typeof FLEET_ACTIONS.SET_ACTION_ERROR;
  payload: string | null;
}

export interface OpenRevokeModalAction {
  type: typeof FLEET_ACTIONS.OPEN_REVOKE_MODAL;
  payload: OrgFleetSession;
}

export interface CloseRevokeModalAction {
  type: typeof FLEET_ACTIONS.CLOSE_REVOKE_MODAL;
}

export interface SetIsRevokingAction {
  type: typeof FLEET_ACTIONS.SET_IS_REVOKING;
  payload: boolean;
}

export interface ResetFiltersAction {
  type: typeof FLEET_ACTIONS.RESET_FILTERS;
}

export type FleetAction =
  | SetSearchQueryAction
  | SetClientTypeFilterAction
  | SetActionErrorAction
  | OpenRevokeModalAction
  | CloseRevokeModalAction
  | SetIsRevokingAction
  | ResetFiltersAction;

export const setSearchQueryAction = (query: string): SetSearchQueryAction => ({
  type: FLEET_ACTIONS.SET_SEARCH_QUERY,
  payload: query,
});

export const setClientTypeFilterAction = (
  filter: ClientFilterType,
): SetClientTypeFilterAction => ({
  type: FLEET_ACTIONS.SET_CLIENT_TYPE_FILTER,
  payload: filter,
});

export const setActionErrorAction = (
  error: string | null,
): SetActionErrorAction => ({
  type: FLEET_ACTIONS.SET_ACTION_ERROR,
  payload: error,
});

export const openRevokeModalAction = (
  session: OrgFleetSession,
): OpenRevokeModalAction => ({
  type: FLEET_ACTIONS.OPEN_REVOKE_MODAL,
  payload: session,
});

export const closeRevokeModalAction = (): CloseRevokeModalAction => ({
  type: FLEET_ACTIONS.CLOSE_REVOKE_MODAL,
});

export const setIsRevokingAction = (
  isRevoking: boolean,
): SetIsRevokingAction => ({
  type: FLEET_ACTIONS.SET_IS_REVOKING,
  payload: isRevoking,
});

export const resetFiltersAction = (): ResetFiltersAction => ({
  type: FLEET_ACTIONS.RESET_FILTERS,
});
