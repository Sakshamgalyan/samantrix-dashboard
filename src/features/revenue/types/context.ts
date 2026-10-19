import type { Dispatch } from "react";
import type { RevenueState } from "@/features/revenue/types/state";
import type { RevenueAction } from "@/features/revenue/types/actions";

export interface RevenueContextValue {
  state: RevenueState;
  dispatch: Dispatch<RevenueAction>;
}
