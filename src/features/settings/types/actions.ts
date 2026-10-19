import type { OrgSettings } from "@/types/dashboard";
import type { ProfileForm } from "@/features/settings/types/api";

export type SettingsAction =
  | { type: "SET_PROFILE_FORM"; payload: ProfileForm }
  | { type: "UPDATE_PROFILE_FIELD"; payload: { field: keyof ProfileForm; value: string } }
  | { type: "SET_SETTINGS_FORM"; payload: OrgSettings }
  | {
      type: "UPDATE_SETTINGS_FIELD";
      payload: { [K in keyof OrgSettings]-?: { field: K; value: OrgSettings[K] } }[keyof OrgSettings];
    }
  | { type: "SET_SAVING_PROFILE"; payload: boolean }
  | { type: "SET_SAVING_SETTINGS"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CONFIRM_NAME"; payload: string }
  | { type: "SET_DEACTIVATING"; payload: boolean };
