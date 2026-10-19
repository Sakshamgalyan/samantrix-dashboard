import type { TabItem } from "@galyan/ui";

export const INVOICE_CHIP: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "danger",
  VOID: "neutral",
};

export const BILLING_TABS: TabItem[] = [
  { id: "INVOICES", label: "Invoices" },
  { id: "PAYMENTS", label: "Payment history" },
];
