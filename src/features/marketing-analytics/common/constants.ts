import type { MarketingRange } from "../types";

export const RANGE_OPTIONS: { id: `${MarketingRange}`; label: string }[] = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
];

export const VISITS_PAGE_SIZE = 10;

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
export function sharePercent(count: number, total: number): string {
  if (total <= 0) return "";
  const pct = (count / total) * 100;
  if (pct > 0 && pct < 1) return "<1%";
  return `${Math.round(pct)}%`;
}
