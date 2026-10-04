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
  range: {
    days: MarketingRange;
    from: string;
    to: string;
    previousFrom: string;
  };
  totals: MarketingTotals;
  previous: MarketingTotals;
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
  topPages: { path: string; visits: number }[];
  channels: LabelCount[];
  devices: LabelCount[];
  browsers: LabelCount[];
  countries: LabelCount[];
  campaigns: { campaign: string; visits: number }[];
  /** True when the daily series was built from a capped sample of a very busy window. */
  truncated: boolean;
}

/** One row of GET /analytics/visitors */
export interface VisitorLogRow {
  id: string;
  visitorId: string;
  sessionId: string;
  ipAddress: string | null;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string;
  path: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

/** GET /analytics/visitors?page=&limit= */
export interface VisitorsResponse {
  data: VisitorLogRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
