import type { BillingCycle } from "@/features/payments/types";

export const ACTIVE_PLANS = { activeOnly: true } as const;
export const RECENT_PAYMENTS = 5;

export const CYCLE_TABS: { id: BillingCycle; label: string }[] = [
  { id: "MONTHLY", label: "Monthly" },
  { id: "YEARLY", label: "Yearly" },
];
