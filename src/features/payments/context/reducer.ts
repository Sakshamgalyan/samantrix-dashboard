import type { PaymentsAction, PaymentsUiState } from "@/features/payments/types";

export const initialPaymentsState: PaymentsUiState = {
  filters: { status: "ALL", provider: "ALL", search: "", page: 1 },
  seatFilters: { paidOnly: true, search: "", page: 1 },
};

/** UI state only: payments, seats, plans and config come from the RTK Query cache. */
export const paymentsReducer = (state: PaymentsUiState, action: PaymentsAction): PaymentsUiState => {
  switch (action.type) {
    case "SET_FILTERS":
      // Changing a filter (anything but the page) goes back to page 1
      return {
        ...state,
        filters: {
          ...state.filters,
          ...("page" in action.payload ? {} : { page: 1 }),
          ...action.payload,
        },
      };
    case "SET_SEAT_FILTERS":
      return {
        ...state,
        seatFilters: {
          ...state.seatFilters,
          ...("page" in action.payload ? {} : { page: 1 }),
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
