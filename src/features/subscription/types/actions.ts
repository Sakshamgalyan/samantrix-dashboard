import type { BillingCycle } from "@/features/payments/types";
import type { CheckoutRequest } from "@/features/subscription/billing-api";

export type SubscriptionAction =
  | { type: "SET_CYCLE"; payload: BillingCycle }
  | { type: "OPEN_CHECKOUT"; payload: CheckoutRequest }
  | { type: "CLOSE_CHECKOUT" };
