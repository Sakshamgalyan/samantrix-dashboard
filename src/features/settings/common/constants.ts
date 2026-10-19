import type { DropdownOption } from "@galyan/ui";

export const INDUSTRY_OPTIONS: DropdownOption[] = [
  "Software & Technology",
  "Financial Services",
  "Healthcare & BioTech",
  "Digital Media & Creative",
  "Consulting & Professional",
  "Manufacturing & Retail",
  "Other",
].map((v) => ({ value: v, label: v }));

export const COMPANY_SIZE_OPTIONS: DropdownOption[] = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

/** Presets plus the saved value if older seed or custom text data is present */
export const withCurrent = (
  options: DropdownOption[],
  current?: string,
): DropdownOption[] =>
  current && !options.some((o) => o.value === current)
    ? [...options, { value: current, label: `${current} employees` }]
    : options;

export const TIMEZONE_OPTIONS: DropdownOption[] = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
];

export const LOCALE_OPTIONS: DropdownOption[] = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "de-DE", label: "Deutsch (Deutschland)" },
  { value: "fr-FR", label: "Français (France)" },
  { value: "ja-JP", label: "日本語 (日本)" },
];
