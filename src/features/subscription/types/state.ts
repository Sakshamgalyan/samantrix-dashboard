import type { BillingCycle } from "@/features/payments/types";
import type { CheckoutRequest } from "@/features/subscription/billing-api";

export interface SubscriptionState {
  cycle: BillingCycle;
  checkout: CheckoutRequest | null;
  checkoutKey: number;
}
