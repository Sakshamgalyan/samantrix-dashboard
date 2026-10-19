import type { RevenueAction } from "@/features/revenue/types/actions";

export const setTimeframe = (timeframe: string): RevenueAction => ({
  type: "SET_TIMEFRAME",
  payload: timeframe,
});
