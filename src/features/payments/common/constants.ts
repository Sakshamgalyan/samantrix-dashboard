import type { ChipVariant } from "@galyan/ui";
import type { PaymentPurpose, PaymentStatus, PlanTier, SeatRow } from "@/features/payments/types";

/** "₹1,23,456": INR in Indian grouping; other currencies in their own format. */
export const money = (value: number, currency = "INR", fractionDigits = 0): string => {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(fractionDigits)}`;
  }
};

/** "₹1.2L", "₹3.4Cr" for chart labels and tight tiles. */
export const compactMoney = (value: number, currency = "INR"): string => {
  if (currency !== "INR") {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, notation: "compact" }).format(value);
  }
  const abs = Math.abs(value);
  if (abs >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (abs >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
};

/** "Oct" / "Oct 25" for a "2026-10" month key. */
export const monthLabel = (month: string, withYear = false): string => {
  const d = new Date(`${month}-01T00:00:00Z`);
  return d.toLocaleDateString(undefined, {
    month: "short",
    ...(withYear ? { year: "2-digit" } : {}),
    timeZone: "UTC",
  });
};

/** Annual discount calculator comparing monthly x 12 against yearly seat price. */
export const getYearlySavings = (monthly: number, yearly: number): number => {
  if (monthly <= 0 || yearly <= 0) return 0;
  const annualMonthly = monthly * 12;
  if (yearly >= annualMonthly) return 0;
  return Math.round(((annualMonthly - yearly) / annualMonthly) * 100);
};

/** Color bar status for seat quota progress. */
export const getBarVariant = (row: SeatRow): "danger" | "warning" | "primary" => {
  if (row.overLimit) return "danger";
  if ((row.utilisation ?? 0) >= 85) return "warning";
  return "primary";
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

export const PLAN_COLORS: Record<PlanTier, string> = {
  FREE: "var(--gy-text-subtle)",
  STARTER: "var(--gy-info)",
  PROFESSIONAL: "var(--gy-primary)",
  ENTERPRISE: "var(--gy-success)",
};

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; chip: ChipVariant }> = {
  PAID: { label: "Paid", chip: "success" },
  CREATED: { label: "Checkout open", chip: "neutral" },
  FAILED: { label: "Failed", chip: "danger" },
  REFUNDED: { label: "Refunded", chip: "warning" },
};

export const PURPOSE_LABELS: Record<PaymentPurpose, string> = {
  NEW_SUBSCRIPTION: "New plan",
  RENEWAL: "Renewal",
  UPGRADE: "Plan change",
  SEAT_PURCHASE: "Extra seats",
  MANUAL: "Manual entry",
};

export const MANUAL_METHODS = [
  { value: "bank_transfer", label: "Bank transfer (NEFT/RTGS/IMPS)" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card (offline)" },
  { value: "other", label: "Other" },
];

export const METHOD_LABELS: Record<string, string> = {
  card: "Card",
  upi: "UPI",
  netbanking: "Net banking",
  wallet: "Wallet",
  emi: "EMI",
  bank_transfer: "Bank transfer",
  cheque: "Cheque",
  cash: "Cash",
  other: "Other",
};

export const PLAN_OPTIONS = (Object.keys(PLAN_LABELS) as PlanTier[]).map((p) => ({
  value: p,
  label: PLAN_LABELS[p],
}));

export const CYCLE_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];
