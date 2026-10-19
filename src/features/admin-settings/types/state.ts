import type { PlatformSetting, PlatformSettingsResponse, SettingCategory } from "@/features/admin-settings/types/api";

export type CategoryTab = "ALL" | SettingCategory;

/** UI state held in the page reducer. */
export interface SettingsUiState {
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

/** UI state plus the server data derived from the cached query. */
export interface SettingsPageState extends SettingsUiState {
  data: PlatformSettingsResponse | null;
  /** First load in progress (nothing to show yet). */
  loading: boolean;
  refreshing: boolean;
  /** First load failed. */
  loadError: string | null;
  /** A background refresh failed; `data` is stale. */
  refreshError: string | null;
  fetchedAt: string | null;
}
