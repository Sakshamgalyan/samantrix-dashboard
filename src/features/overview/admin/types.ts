import type { DeveloperCounts } from "@/features/developers/types";
import type { AdminOrganization, OrganizationCounts } from "@/features/organizations/types";
import type { PaymentRow, PaymentsSummary } from "@/features/payments/types";
import type { RevenueReport } from "@/features/revenue/types/api";

/** GET /analytics/platform-overview (only what the home page shows). */
export interface PlatformOverview {
  users: { newLast30d: number; growthPercent: number | null };
  sessions: { activeNow: number; signInsLast30d: number };
  services: { name: string; healthy: boolean }[];
  /** Newest 6 sign-ups */
  recentUsers: {
    id: string;
    fullName: string;
    userType: string;
    createdAt: string;
    organization: { name: string } | null;
  }[];
}

/** GET /leads/summary (leads workstream); every field optional so older shapes still render. */
export interface LeadsSummary {
  total?: number;
  awaitingFollowUp?: number;
  byStatus?: Partial<Record<string, number>>;
  newLast7d?: number;
  newLast30d?: number;
  newPrev30d?: number;
  newThisWeek?: number;
  rates?: {
    contactedRate?: number;
    conversionRate?: number;
    winRate?: number;
    quoteAcceptanceRate?: number;
    respondedWithin24hRate?: number;
  };
  value?: { currency?: string; won?: number; openPipeline?: number };
  quotes?: { sent?: number; accepted?: number };
  followUps?: { dueToday?: number; overdue?: number; unassignedOpen?: number };
  avgFirstResponseHours?: number | null;
  trend?: { date: string; count: number }[];
}

export interface LeadRow {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  type: string;
  status: string;
  createdAt: string;
}

export interface AdminOverviewData {
  platform: PlatformOverview | null;
  leads: LeadsSummary | null;
  recentLeads: LeadRow[];
  /** GET /organizations/admin/summary counts */
  organizations: OrganizationCounts | null;
  recentOrganizations: Pick<AdminOrganization, "id" | "name" | "planTier" | "createdAt">[];
  /** GET /auth/developers/summary counts */
  developers: DeveloperCounts | null;
  /** GET /finance/payments/summary (failed payments, seat totals) */
  paymentsSummary: PaymentsSummary | null;
  recentPayments: Pick<PaymentRow, "id" | "paidAt" | "createdAt" | "status" | "amount" | "currency" | "organization">[];
  revenue: RevenueReport | null;
  loadedAt: string;
}
