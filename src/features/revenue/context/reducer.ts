import type { RevenueState } from "@/features/revenue/types/state";
import type { RevenueAction } from "@/features/revenue/types/actions";

export const initialRevenueState: RevenueState = {
  selectedTimeframe: "12m",
};

export function revenueReducer(state: RevenueState, action: RevenueAction): RevenueState {
  switch (action.type) {
    case "SET_TIMEFRAME":
      return {
        ...state,
        selectedTimeframe: action.payload,
      };
    default:
      return state;
  }
}
