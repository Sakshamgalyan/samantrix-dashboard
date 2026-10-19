import type { MarketingRange } from "@/features/marketing-analytics/types";

export const RANGE_OPTIONS: { id: `${MarketingRange}`; label: string }[] = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
];

/** Theme-token palette shared by the page's charts. */
export const CHART_COLORS = [
  "var(--gy-primary)",
  "var(--gy-info)",
  "var(--gy-success)",
  "var(--gy-warning)",
  "var(--gy-secondary)",
  "var(--gy-danger)",
  "var(--gy-text-subtle)",
];

/** Share of a total as "42%" (or "<1%"); "" when the total is 0. */
export const sharePercent = (count: number, total: number): string => {
  if (total <= 0) return "";
  const pct = (count / total) * 100;
  if (pct > 0 && pct < 1) return "<1%";
  return `${Math.round(pct)}%`;
};

/** Converts a country name or code to a flag emoji and clean name. */
export const getCountryVisual = (country: string): { flag: string; name: string } => {
  const norm = country.trim().toLowerCase();
  const map: Record<string, string> = {
    india: "🇮🇳",
    in: "🇮🇳",
    germany: "🇩🇪",
    de: "🇩🇪",
    "united states": "🇺🇸",
    usa: "🇺🇸",
    us: "🇺🇸",
    "united kingdom": "🇬🇧",
    uk: "🇬🇧",
    gb: "🇬🇧",
    canada: "🇨🇦",
    ca: "🇨🇦",
    france: "🇫🇷",
    fr: "🇫🇷",
    australia: "🇦🇺",
    au: "🇦🇺",
    japan: "🇯🇵",
    jp: "🇯🇵",
    singapore: "🇸🇬",
    sg: "🇸🇬",
    netherlands: "🇳🇱",
    nl: "🇳🇱",
    brazil: "🇧🇷",
    br: "🇧🇷",
    china: "🇨🇳",
    cn: "🇨🇳",
    spain: "🇪🇸",
    es: "🇪🇸",
    italy: "🇮🇹",
    it: "🇮🇹",
    russia: "🇷🇺",
    ru: "🇷🇺",
    sweden: "🇸🇪",
    se: "🇸🇪",
    switzerland: "🇨🇭",
    ch: "🇨🇭",
    uae: "🇦🇪",
    ae: "🇦🇪",
    "united arab emirates": "🇦🇪",
    ireland: "🇮🇪",
    ie: "🇮🇪",
    poland: "🇵🇱",
    pl: "🇵🇱",
    israel: "🇮🇱",
    il: "🇮🇱",
  };
  return {
    flag: map[norm] || "🌐",
    name: country,
  };
};
