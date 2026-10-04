import type { ChipVariant } from "@galyan/ui";
import { formatMoney, formatNumber, titleCase } from "@/lib/format";
import type { PlanTier } from "../types";

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

/** Preferred tab order for subscription statuses; unknown ones follow. */
export const SUBSCRIPTION_STATUS_ORDER = [
  "active",
  "trialing",
  "past_due",
  "canceled",
];

/** Preferred tab order for invoice statuses; unknown ones follow. */
export const INVOICE_STATUS_ORDER = ["PAID", "PENDING", "FAILED", "VOID"];

const SUBSCRIPTION_CHIPS: Record<string, ChipVariant> = {
  active: "success",
  trialing: "soft",
  past_due: "warning",
  canceled: "neutral",
  cancelled: "neutral",
  unpaid: "danger",
  incomplete: "warning",
};

const INVOICE_CHIPS: Record<string, ChipVariant> = {
  PAID: "success",
  PENDING: "warning",
  OPEN: "warning",
  OVERDUE: "danger",
  FAILED: "danger",
  VOID: "neutral",
  REFUNDED: "neutral",
};

export const subscriptionChip = (status: string): ChipVariant =>
  SUBSCRIPTION_CHIPS[status] ?? "neutral";

export const invoiceChip = (status: string): ChipVariant =>
  INVOICE_CHIPS[status] ?? "neutral";

/** "past_due" → "Past due", "PAID" → "Paid" */
export const statusLabel = (status: string) => {
  const label = titleCase(status);
  return label.charAt(0) + label.slice(1).toLowerCase();
};

/** Sort statuses by a preferred order, unknown ones alphabetically after. */
export function orderStatuses<T extends { status: string }>(
  rows: T[],
  order: string[],
): T[] {
  const rank = (s: string) => {
    const i = order.indexOf(s);
    return i === -1 ? order.length : i;
  };
  return rows
    .slice()
    .sort(
      (a, b) =>
        rank(a.status) - rank(b.status) || a.status.localeCompare(b.status),
    );
}

/** "2026-10" → "Oct 2026" (UTC). */
export const formatMonth = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

/** Money with cents only when there are cents; tolerates non-ISO currency strings. */
export function money(value: number, currency = "USD"): string {
  try {
    return formatMoney(value, currency, Number.isInteger(value) ? 0 : 2);
  } catch {
    return `${formatNumber(value)} ${currency}`;
  }
}
