import type { PlatformSetting } from "@/features/admin-settings/types/api";
import type { CategoryTab } from "@/features/admin-settings/types/state";
import type { SettingsAction } from "@/features/admin-settings/types/actions";

export const setActiveTab = (tab: CategoryTab): SettingsAction => ({
  type: "SET_ACTIVE_TAB",
  payload: tab,
});

export const setDraft = (key: string, value: string): SettingsAction => ({
  type: "SET_DRAFT",
  payload: { key, value },
});

export const clearDraft = (key: string): SettingsAction => ({
  type: "CLEAR_DRAFT",
  payload: key,
});

export const setSaving = (key: string, saving: boolean): SettingsAction => ({
  type: "SET_SAVING",
  payload: { key, saving },
});

export const setAddOpen = (open: boolean): SettingsAction => ({
  type: "SET_ADD_OPEN",
  payload: open,
});

export const setCreating = (creating: boolean): SettingsAction => ({
  type: "SET_CREATING",
  payload: creating,
});

export const setEditTarget = (
  setting: PlatformSetting | null,
): SettingsAction => ({
  type: "SET_EDIT_TARGET",
  payload: setting,
});

export const setUpdatingDetails = (updating: boolean): SettingsAction => ({
  type: "SET_UPDATING_DETAILS",
  payload: updating,
});

export const setDeleteTarget = (
  setting: PlatformSetting | null,
): SettingsAction => ({
  type: "SET_DELETE_TARGET",
  payload: setting,
});

export const setDeleting = (deleting: boolean): SettingsAction => ({
  type: "SET_DELETING",
  payload: deleting,
});
