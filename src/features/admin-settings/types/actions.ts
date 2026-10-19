import type { PlatformSetting } from "@/features/admin-settings/types/api";
import type { CategoryTab } from "@/features/admin-settings/types/state";

export type SettingsAction =
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
