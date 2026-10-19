import type { Paginated } from "@/features/common/pagination";

export type LeadType = "CONTACT" | "WAITLIST" | "ENTERPRISE" | "DEMO";
export type LeadStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CONTACTED"
  | "QUALIFIED"
  | "QUOTED"
  | "WON"
  | "LOST"
  | "ARCHIVED";
export type LeadActivityType = "NOTE" | "EMAIL" | "CALL" | "MEETING" | "QUOTE" | "STATUS_CHANGE";
export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type PlanTier = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
export type BillingCycle = "MONTHLY" | "YEARLY";

/** Row of `GET /leads` (list columns only). Missing fields are null (the backend never invents values). */
export interface LeadListItem {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  country: string | null;
  assignedTo: { id: string; fullName: string } | null;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
}

/** Row of `GET /leads/:id/activities` (the timeline, newest first). */
export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  subject: string | null;
  body: string | null;
  actor: { fullName: string } | null;
  createdAt: string;
}

/** A quote as the lead drawer lists it (also what quote mutations are read for). */
export interface LeadQuote {
  id: string;
  quoteNumber: string;
  planTier: PlanTier | null;
  billingCycle: BillingCycle;
  seats: number;
  currency: string;
  total: number;
  validUntil: string;
  status: QuoteStatus;
  sentAt: string | null;
}

/** `GET /leads/:id` (also returned by the lead mutations). The timeline is paged separately. */
export interface LeadDetail {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  country: string | null;
  teamSize: string | null;
  interest: string | null;
  message: string | null;
  source: string | null;
  estimatedValue: number | null;
  assignedToId: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** The 20 most recent quotes. */
  quotes: LeadQuote[];
  /** All quotes on the lead. */
  quoteCount: number;
}

export type LeadsPage = Paginated<LeadListItem>;
export type LeadActivitiesPage = Paginated<LeadActivity>;

/** `GET /leads/summary` (shared with the admin overview). */
export interface LeadsSummary {
  total: number;
  awaitingFollowUp: number;
  byStatus: Record<LeadStatus, number>;
  /** Sign-ups per waitlist sub-status (same buckets as the queue's filter chips). */
  waitlist: { total: number; queued: number; invited: number; onboarded: number; rejected: number };
  pipeline: { open: number; won: number };
  newLast7d: number;
  newLast30d: number;
  newPrev30d: number;
  newThisMonth: number;
  rates: {
    contactedRate: number;
    conversionRate: number;
    quoteAcceptanceRate: number;
    respondedWithin24hRate: number;
  };
  value: { currency: string; won: number; openPipeline: number };
  quotes: { sent: number; accepted: number };
  followUps: { dueToday: number; overdue: number; unassignedOpen: number };
  avgFirstResponseHours: number | null;
  trend: Array<{ date: string; count: number }>;
}

/** `GET /leads/assignees` */
export interface Assignee {
  id: string;
  fullName: string;
}

/** `GET /leads/plans` */
export interface PricePlan {
  planTier: PlanTier;
  name: string;
  currency: string;
  pricePerSeatMonthly: number;
  pricePerSeatYearly: number;
  minSeats: number;
}

export type WaitlistStatus = "QUEUED" | "INVITED" | "ONBOARDED" | "REJECTED";

/** Row of `GET /leads/waitlist/queue` */
export interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  teamSize: string | null;
  status: WaitlistStatus;
  source: string | null;
  createdAt: string;
}

export type WaitlistPage = Paginated<WaitlistEntry>;

/** `PATCH /leads/:id` */
export interface UpdateLeadRequest {
  status?: LeadStatus;
  assignedToId?: string | null;
  estimatedValue?: number | null;
  nextFollowUpAt?: string | null;
  name?: string;
  phone?: string | null;
  company?: string;
  jobTitle?: string;
  country?: string;
}

export interface QuoteItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

/** `POST /leads/:id/quotes` */
export interface CreateQuoteRequest {
  planTier?: PlanTier;
  billingCycle: BillingCycle;
  seats: number;
  items?: QuoteItemInput[];
  discount: number;
  taxPercent: number;
  validUntil?: string;
  notes?: string;
}

/** `POST /leads/waitlist/batch-invite` */
export interface BatchInviteResponse {
  invitedCount: number;
  skippedCount: number;
  invitedIds: string[];
}
