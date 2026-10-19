import type { OrgSettings } from "@/types/dashboard";
import type { ProfileForm } from "@/features/settings/types/api";

export interface SettingsState {
  profileForm: ProfileForm;
  settingsForm: OrgSettings;
  savingProfile: boolean;
  savingSettings: boolean;
  error: string | null;
  confirmName: string;
  deactivating: boolean;
}
