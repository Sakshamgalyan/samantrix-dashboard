import type { PaymentFilters, PaymentsAction, SeatFilters } from "@/features/payments/types";

export const setFilters = (payload: Partial<PaymentFilters>): PaymentsAction => ({ type: "SET_FILTERS", payload });
export const setSeatFilters = (payload: Partial<SeatFilters>): PaymentsAction => ({ type: "SET_SEAT_FILTERS", payload });
