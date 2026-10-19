import type { OrgRoomItem, RoomType, OrgOfficeConfig } from "./api";

export type SpacesAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_TYPE_FILTER"; payload: string }
  | { type: "RESET_FILTERS" }
  | { type: "OPEN_CREATE_MODAL" }
  | { type: "CLOSE_CREATE_MODAL" }
  | { type: "OPEN_EDIT_MODAL"; payload: OrgRoomItem }
  | { type: "CLOSE_EDIT_MODAL" }
  | { type: "OPEN_DELETE_MODAL"; payload: OrgRoomItem }
  | { type: "CLOSE_DELETE_MODAL" }
  | { type: "SET_ACTION_ERROR"; payload: string | null }
  | { type: "SET_IS_SAVING"; payload: boolean }
  | { type: "SET_FORM_NAME"; payload: string }
  | { type: "SET_FORM_TYPE"; payload: RoomType }
  | { type: "SET_FORM_CAPACITY"; payload: number }
  | { type: "SET_FORM_IS_PRIVATE"; payload: boolean }
  | { type: "OPEN_CONFIG_MODAL"; payload?: OrgOfficeConfig }
  | { type: "CLOSE_CONFIG_MODAL" }
  | { type: "SET_CONFIG_NAME"; payload: string }
  | { type: "SET_CONFIG_MAP_ASSET_KEY"; payload: string }
  | { type: "SET_CONFIG_MAX_CAPACITY"; payload: number }
  | { type: "SET_CONFIG_DEFAULT_DIMENSION"; payload: "3d" | "2d" }
  | { type: "SET_CONFIG_ALLOW_2D_MODE"; payload: boolean }
  | { type: "SET_CONFIG_PROXIMITY_RADIUS"; payload: number }
  | { type: "SET_CONFIG_AMBIENT_SOUND"; payload: string }
  | { type: "SET_CONFIG_AMBIENT_VOLUME"; payload: number }
  | { type: "SET_CONFIG_COLLISION_PHYSICS"; payload: boolean }
  | { type: "SET_CONFIG_WELCOME_MESSAGE"; payload: string }
  | { type: "SET_CONFIG_ENABLE_GUEST_ACCESS"; payload: boolean };
