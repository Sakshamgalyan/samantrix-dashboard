import type { SubscriptionState } from "@/features/subscription/types/state";
import type { SubscriptionAction } from "@/features/subscription/types/actions";

export const initialSubscriptionState: SubscriptionState = {
  cycle: "YEARLY",
  checkout: null,
  checkoutKey: 0,
};

export function subscriptionReducer(
  state: SubscriptionState,
  action: SubscriptionAction,
): SubscriptionState {
  switch (action.type) {
    case "SET_CYCLE":
      return { ...state, cycle: action.payload };
    case "OPEN_CHECKOUT":
      return {
        ...state,
        checkout: action.payload,
        checkoutKey: state.checkoutKey + 1,
      };
    case "CLOSE_CHECKOUT":
      return { ...state, checkout: null };
    default:
      return state;
  }
}
