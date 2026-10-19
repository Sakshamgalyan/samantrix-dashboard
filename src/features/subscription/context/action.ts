import type { BillingCycle } from "@/features/payments/types";
import type { CheckoutRequest } from "@/features/subscription/billing-api";
import type { SubscriptionAction } from "@/features/subscription/types/actions";

export const setCycleAction = (payload: BillingCycle): SubscriptionAction => ({
  type: "SET_CYCLE",
  payload,
});

export const openCheckoutAction = (payload: CheckoutRequest): SubscriptionAction => ({
  type: "OPEN_CHECKOUT",
  payload,
});

export const closeCheckoutAction = (): SubscriptionAction => ({
  type: "CLOSE_CHECKOUT",
});
