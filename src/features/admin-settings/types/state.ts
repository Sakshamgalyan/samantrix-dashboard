import type { PlatformSetting, PlatformSettingsResponse, SettingCategory } from "./api";

export type CategoryTab = "ALL" | SettingCategory;

export interface SettingsPageState {
  data: PlatformSettingsResponse | null;
  /** First load in progress (nothing to show yet). */
  loading: boolean;
  refreshing: boolean;
  /** First load failed. */
  loadError: string | null;
  /** A background refresh failed; `data` is stale. */
  refreshError: string | null;
  fetchedAt: string | null;

  activeTab: CategoryTab;
  /** Unsaved edits by setting key (raw input text; for secrets, the replacement value). */
  drafts: Record<string, string>;
  /** Keys with a save in flight. */
  savingKeys: string[];

  addOpen: boolean;
  creating: boolean;
  editTarget: PlatformSetting | null;
  updatingDetails: boolean;
  deleteTarget: PlatformSetting | null;
  deleting: boolean;
}
