import type { ChipVariant } from "@galyan/ui";
import type {
  LeadActivityType,
  LeadStatus,
  LeadType,
  PlanTier,
  QuoteStatus,
  WaitlistStatus,
} from "@/features/leads/types";
import type { PipelineView } from "@/features/leads/types";

export const UNASSIGNED = "UNASSIGNED";

export const STATUS_META: Record<LeadStatus, { label: string; variant: ChipVariant }> = {
  PENDING: { label: "New", variant: "primary" },
  CONFIRMED: { label: "Confirmed", variant: "primary" },
  CONTACTED: { label: "Contacted", variant: "soft" },
  QUALIFIED: { label: "Qualified", variant: "warning" },
  QUOTED: { label: "Quoted", variant: "warning" },
  WON: { label: "Won", variant: "success" },
  LOST: { label: "Lost", variant: "danger" },
  ARCHIVED: { label: "Archived", variant: "neutral" },
};

/** Statuses a developer can move a sales lead to, in pipeline order. */
export const PIPELINE_STATUSES: LeadStatus[] = [
  "PENDING",
  "CONTACTED",
  "QUALIFIED",
  "QUOTED",
  "WON",
  "LOST",
  "ARCHIVED",
];

export const TYPE_LABEL: Record<LeadType, string> = {
  CONTACT: "Contact",
  DEMO: "Demo",
  ENTERPRISE: "Enterprise",
  WAITLIST: "Waitlist",
};

export const VIEW_OPTIONS: { id: PipelineView; label: string }[] = [
  { id: "OPEN", label: "Open" },
  { id: "FOLLOW_UP_DUE", label: "Follow-up due" },
  { id: "PENDING", label: "New" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "QUOTED", label: "Quoted" },
  { id: "WON", label: "Won" },
  { id: "LOST", label: "Lost" },
  { id: "ALL", label: "All" },
];

export const ACTIVITY_LABEL: Record<LeadActivityType, string> = {
  NOTE: "Note",
  EMAIL: "Email sent",
  CALL: "Call",
  MEETING: "Meeting",
  QUOTE: "Quote",
  STATUS_CHANGE: "Update",
};

export const QUOTE_STATUS_META: Record<QuoteStatus, { label: string; variant: ChipVariant }> = {
  DRAFT: { label: "Draft", variant: "neutral" },
  SENT: { label: "Sent", variant: "primary" },
  ACCEPTED: { label: "Accepted", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  EXPIRED: { label: "Expired", variant: "warning" },
};

export const WAITLIST_STATUS_META: Record<WaitlistStatus, { label: string; variant: ChipVariant }> = {
  QUEUED: { label: "Queued", variant: "primary" },
  INVITED: { label: "Invited", variant: "warning" },
  ONBOARDED: { label: "Onboarded", variant: "success" },
  REJECTED: { label: "Rejected", variant: "neutral" },
};

export const PLAN_LABEL: Record<PlanTier, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

/** "₹1,50,000" — INR amounts across the leads page. */
export const formatInr = (value: number, currency = "INR"): string => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

/** Display name of a lead: name, else the email's local part. */
export const leadName = (lead: { name: string | null; email: string }) =>
  lead.name || lead.email.split("@")[0];

/** `yyyy-mm-dd` in local time (value for <input type="date">). */
export const toDateInput = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Local date input → ISO at 09:00 local, so "today" doesn't land on yesterday in UTC. */
export const fromDateInput = (value: string): string | null => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 9, 0, 0).toISOString();
};
