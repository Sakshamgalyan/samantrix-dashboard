import type { PlatformSetting, SettingCategory } from "@/features/admin-settings/types/api";

export const CATEGORY_ORDER: SettingCategory[] = [
  "GENERAL",
  "AUTH",
  "BILLING",
  "INTEGRATION",
];

export const CATEGORY_META: Record<
  SettingCategory,
  { label: string; subtitle: string }
> = {
  GENERAL: {
    label: "General",
    subtitle: "Branding, support contact and global switches.",
  },
  AUTH: {
    label: "Authentication",
    subtitle: "Sign-up, sessions and account recovery.",
  },
  BILLING: {
    label: "Billing",
    subtitle: "Trials and subscription defaults.",
  },
  INTEGRATION: {
    label: "Integrations",
    subtitle: "Credentials and endpoints for third-party services.",
  },
};

export const CATEGORY_OPTIONS = CATEGORY_ORDER.map((c) => ({
  value: c,
  label: CATEGORY_META[c].label,
}));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The current value of a non-secret setting as input text. */
export const valueToText = (setting: PlatformSetting): string => {
  if (setting.isSecret || setting.value === null) return "";
  return String(setting.value);
};

/** Client-side mirror of the backend validation; null when the draft is acceptable. */
export const validateDraft = (
  setting: PlatformSetting,
  draft: string,
): string | null => {
  const value = draft.trim();
  if (setting.isSecret) {
    return value.length > 2000 ? "At most 2000 characters." : null;
  }
  switch (setting.type) {
    case "boolean":
      return value === "true" || value === "false" ? null : "Must be on or off.";
    case "number": {
      if (!/^-?\d+$/.test(value)) return "Enter a whole number.";
      const n = Number(value);
      if (setting.min !== null && n < setting.min)
        return `Must be at least ${setting.min}.`;
      if (setting.max !== null && n > setting.max)
        return `Must be at most ${setting.max}.`;
      return null;
    }
    case "email":
      return EMAIL_PATTERN.test(value) ? null : "Enter a valid email address.";
    default:
      if (!value) return "Value cannot be empty.";
      return value.length > 2000 ? "At most 2000 characters." : null;
  }
};

/** True when the draft would actually change the stored value. */
export const isDirty = (
  setting: PlatformSetting,
  draft: string | undefined,
): boolean => {
  if (draft === undefined) return false;
  if (setting.isSecret) return draft.trim().length > 0;
  return draft.trim() !== valueToText(setting);
};

/** Human text for a default value, e.g. "On", "60", "Simantrix". */
export const formatValue = (setting: PlatformSetting, value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (setting.type === "boolean") return value === true ? "On" : "Off";
  return String(value);
};
