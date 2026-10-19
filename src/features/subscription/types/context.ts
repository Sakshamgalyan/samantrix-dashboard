import type { Dispatch } from "react";
import type { SubscriptionState } from "@/features/subscription/types/state";
import type { SubscriptionAction } from "@/features/subscription/types/actions";

export interface SubscriptionContextValue {
  state: SubscriptionState;
  dispatch: Dispatch<SubscriptionAction>;
}
