import type { Dispatch } from "react";
import type { BillingState } from "@/features/billing/types/state";
import type { BillingAction } from "@/features/billing/types/actions";

export interface BillingContextValue {
  state: BillingState;
  dispatch: Dispatch<BillingAction>;
}
