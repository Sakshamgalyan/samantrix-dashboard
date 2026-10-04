import type React from "react";
import type { PlatformSetting } from "./api";
import type { SettingsAction } from "./actions";
import type { CategoryTab, SettingsPageState } from "./state";
import type { AddSettingFormValues, EditSettingFormValues } from "./forms";

export interface SettingsPageContextType {
  state: SettingsPageState;
  dispatch: React.Dispatch<SettingsAction>;

  canEdit: boolean;

  load: () => Promise<void>;
  setActiveTab: (tab: CategoryTab) => void;
  setDraft: (key: string, value: string) => void;
  discardDraft: (key: string) => void;

  /** Saves the draft of one setting; true on success. */
  saveSetting: (setting: PlatformSetting) => Promise<boolean>;

  openAdd: () => void;
  closeAdd: () => void;
  createSetting: (values: AddSettingFormValues) => Promise<boolean>;

  openEdit: (setting: PlatformSetting) => void;
  closeEdit: () => void;
  updateDetails: (values: EditSettingFormValues) => Promise<boolean>;

  openDelete: (setting: PlatformSetting) => void;
  closeDelete: () => void;
  confirmDelete: () => Promise<void>;
}
