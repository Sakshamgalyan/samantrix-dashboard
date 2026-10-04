/** Shapes returned by GET/POST/PATCH/DELETE /platform-settings (backend: platform-settings module). */

export type SettingCategory = "GENERAL" | "AUTH" | "BILLING" | "INTEGRATION";
export type SettingValueType = "string" | "number" | "boolean" | "email";
export type SettingValue = string | number | boolean;

export interface PlatformSetting {
  key: string;
  label: string;
  description: string | null;
  category: SettingCategory;
  type: SettingValueType;
  /** Defined by the platform (always listed, fixed category and type). */
  isBuiltIn: boolean;
  /** Built-in setting with nothing stored: `value` is its default. */
  isDefault: boolean;
  isSecret: boolean;
  /** Always null for secrets (write-only). */
  value: SettingValue | null;
  maskedValue: string | null;
  hasValue: boolean;
  defaultValue: SettingValue | null;
  min: number | null;
  max: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PlatformSettingsSummary {
  total: number;
  configured: number;
  usingDefaults: number;
  secretsStored: number;
  lastUpdatedAt: string | null;
}

export interface PlatformSettingsResponse {
  categories: { category: SettingCategory; settings: PlatformSetting[] }[];
  summary: PlatformSettingsSummary;
  /** Only superadmins may change settings. */
  canEdit: boolean;
}

export interface CreateSettingPayload {
  key: string;
  value: string;
  description?: string;
  category: SettingCategory;
  isSecret?: boolean;
}

export interface UpdateSettingPayload {
  value?: string;
  description?: string;
  category?: SettingCategory;
}

export interface RemoveSettingResult {
  key: string;
  resetToDefault: boolean;
}
