import type { OrgSettings } from "@/types/dashboard";
import type { SettingsAction } from "@/features/settings/types/actions";
import type { ProfileForm } from "@/features/settings/types/api";

export const setProfileForm = (profile: ProfileForm): SettingsAction => ({
  type: "SET_PROFILE_FORM",
  payload: profile,
});

export const updateProfileField = (field: keyof ProfileForm, value: string): SettingsAction => ({
  type: "UPDATE_PROFILE_FIELD",
  payload: { field, value },
});

export const setSettingsForm = (settings: OrgSettings): SettingsAction => ({
  type: "SET_SETTINGS_FORM",
  payload: settings,
});

export const updateSettingsField = <K extends keyof OrgSettings>(
  field: K,
  value: OrgSettings[K],
): SettingsAction =>
  ({
    type: "UPDATE_SETTINGS_FIELD",
    payload: { field, value },
  }) as SettingsAction;

export const setSavingProfile = (saving: boolean): SettingsAction => ({
  type: "SET_SAVING_PROFILE",
  payload: saving,
});

export const setSavingSettings = (saving: boolean): SettingsAction => ({
  type: "SET_SAVING_SETTINGS",
  payload: saving,
});

export const setError = (error: string | null): SettingsAction => ({
  type: "SET_ERROR",
  payload: error,
});

export const setConfirmName = (name: string): SettingsAction => ({
  type: "SET_CONFIRM_NAME",
  payload: name,
});

export const setDeactivating = (deactivating: boolean): SettingsAction => ({
  type: "SET_DEACTIVATING",
  payload: deactivating,
});
