import type { PlatformSetting, PlatformSettingsResponse } from "./api";
import type { CategoryTab } from "./state";

export type SettingsAction =
  | { type: "LOAD_START"; payload: { background: boolean } }
  | { type: "LOAD_SUCCESS"; payload: { data: PlatformSettingsResponse; at: string } }
  | { type: "LOAD_FAILURE"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: CategoryTab }
  | { type: "SET_DRAFT"; payload: { key: string; value: string } }
  | { type: "CLEAR_DRAFT"; payload: string }
  | { type: "SET_SAVING"; payload: { key: string; saving: boolean } }
  | { type: "SET_ADD_OPEN"; payload: boolean }
  | { type: "SET_CREATING"; payload: boolean }
  | { type: "SET_EDIT_TARGET"; payload: PlatformSetting | null }
  | { type: "SET_UPDATING_DETAILS"; payload: boolean }
  | { type: "SET_DELETE_TARGET"; payload: PlatformSetting | null }
  | { type: "SET_DELETING"; payload: boolean };
