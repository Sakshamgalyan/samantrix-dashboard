import type { OrgRoomItem, RoomType, OrgOfficeConfig } from "../types/api";
import type { SpacesAction } from "../types/actions";

export const setSearchQueryAction = (query: string): SpacesAction => ({
  type: "SET_SEARCH_QUERY",
  payload: query,
});

export const setTypeFilterAction = (filter: string): SpacesAction => ({
  type: "SET_TYPE_FILTER",
  payload: filter,
});

export const resetFiltersAction = (): SpacesAction => ({
  type: "RESET_FILTERS",
});

export const openCreateModalAction = (): SpacesAction => ({
  type: "OPEN_CREATE_MODAL",
});

export const closeCreateModalAction = (): SpacesAction => ({
  type: "CLOSE_CREATE_MODAL",
});

export const openEditModalAction = (room: OrgRoomItem): SpacesAction => ({
  type: "OPEN_EDIT_MODAL",
  payload: room,
});

export const closeEditModalAction = (): SpacesAction => ({
  type: "CLOSE_EDIT_MODAL",
});

export const openDeleteModalAction = (room: OrgRoomItem): SpacesAction => ({
  type: "OPEN_DELETE_MODAL",
  payload: room,
});

export const closeDeleteModalAction = (): SpacesAction => ({
  type: "CLOSE_DELETE_MODAL",
});

export const setActionErrorAction = (error: string | null): SpacesAction => ({
  type: "SET_ACTION_ERROR",
  payload: error,
});

export const setIsSavingAction = (isSaving: boolean): SpacesAction => ({
  type: "SET_IS_SAVING",
  payload: isSaving,
});

export const setFormNameAction = (name: string): SpacesAction => ({
  type: "SET_FORM_NAME",
  payload: name,
});

export const setFormTypeAction = (type: RoomType): SpacesAction => ({
  type: "SET_FORM_TYPE",
  payload: type,
});

export const setFormCapacityAction = (capacity: number): SpacesAction => ({
  type: "SET_FORM_CAPACITY",
  payload: capacity,
});

export const setFormIsPrivateAction = (isPrivate: boolean): SpacesAction => ({
  type: "SET_FORM_IS_PRIVATE",
  payload: isPrivate,
});

export const openConfigModalAction = (office?: OrgOfficeConfig): SpacesAction => ({
  type: "OPEN_CONFIG_MODAL",
  payload: office,
});

export const closeConfigModalAction = (): SpacesAction => ({
  type: "CLOSE_CONFIG_MODAL",
});

export const setConfigNameAction = (name: string): SpacesAction => ({
  type: "SET_CONFIG_NAME",
  payload: name,
});

export const setConfigMapAssetKeyAction = (key: string): SpacesAction => ({
  type: "SET_CONFIG_MAP_ASSET_KEY",
  payload: key,
});

export const setConfigMaxCapacityAction = (cap: number): SpacesAction => ({
  type: "SET_CONFIG_MAX_CAPACITY",
  payload: cap,
});

export const setConfigDefaultDimensionAction = (dim: "3d" | "2d"): SpacesAction => ({
  type: "SET_CONFIG_DEFAULT_DIMENSION",
  payload: dim,
});

export const setConfigAllow2dModeAction = (allow: boolean): SpacesAction => ({
  type: "SET_CONFIG_ALLOW_2D_MODE",
  payload: allow,
});

export const setConfigProximityRadiusAction = (radius: number): SpacesAction => ({
  type: "SET_CONFIG_PROXIMITY_RADIUS",
  payload: radius,
});

export const setConfigAmbientSoundAction = (sound: string): SpacesAction => ({
  type: "SET_CONFIG_AMBIENT_SOUND",
  payload: sound,
});

export const setConfigAmbientVolumeAction = (vol: number): SpacesAction => ({
  type: "SET_CONFIG_AMBIENT_VOLUME",
  payload: vol,
});

export const setConfigCollisionPhysicsAction = (coll: boolean): SpacesAction => ({
  type: "SET_CONFIG_COLLISION_PHYSICS",
  payload: coll,
});

export const setConfigWelcomeMessageAction = (msg: string): SpacesAction => ({
  type: "SET_CONFIG_WELCOME_MESSAGE",
  payload: msg,
});

export const setConfigEnableGuestAccessAction = (allow: boolean): SpacesAction => ({
  type: "SET_CONFIG_ENABLE_GUEST_ACCESS",
  payload: allow,
});
