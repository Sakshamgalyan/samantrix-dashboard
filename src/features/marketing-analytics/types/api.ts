import type { Paginated } from "@/features/common/pagination";

/** Reporting windows accepted by GET /analytics/marketing?range= */
export type MarketingRange = 7 | 30 | 90;

export interface LabelCount {
  label: string;
  count: number;
}

export interface MarketingTotals {
  visits: number;
  uniqueVisitors: number;
  sessions: number;
  leads: number;
  /** Leads per 100 unique visitors; null when nobody visited. */
  conversionRate: number | null;
}

/** GET /analytics/marketing?range=7|30|90 */
export interface MarketingReport {
  generatedAt: string;
  /** `to` is exclusive (start of tomorrow, UTC). */
  range: { from: string; to: string };
  totals: MarketingTotals;
  previous: Omit<MarketingTotals, "leads">;
  /** Percent change vs the previous period (conversionRate: percentage points); null without a baseline. */
  change: {
    visits: number | null;
    uniqueVisitors: number | null;
    sessions: number | null;
    leads: number | null;
    conversionRate: number | null;
  };
  leadsByType: { waitlist: number; contact: number };
  trend: {
    date: string;
    visits: number;
    uniqueVisitors: number;
    leads: number;
  }[];
  /** Top 8. */
  topPages: { path: string; visits: number }[];
  channels: LabelCount[];
  devices: LabelCount[];
  browsers: LabelCount[];
  /** Top 8. */
  countries: LabelCount[];
  /** Top 8. */
  campaigns: { campaign: string; visits: number }[];
  /** True when the daily series was built from a capped sample of a very busy window. */
  truncated: boolean;
}

/** One row of GET /analytics/visitors (the columns the recent-visits feed shows). */
export interface VisitorLogRow {
  id: string;
  path: string;
  deviceType: string;
  city: string | null;
  country: string | null;
  browser: string | null;
  os: string | null;
  utmSource: string | null;
  referrer: string | null;
  createdAt: string;
}

/** GET /analytics/visitors?page=&limit= */
export type VisitorsResponse = Paginated<VisitorLogRow>;
