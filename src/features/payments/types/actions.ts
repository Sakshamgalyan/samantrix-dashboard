import type { PaymentFilters, SeatFilters } from "@/features/payments/types/api";

export type PaymentsAction =
  | { type: "SET_FILTERS"; payload: Partial<PaymentFilters> }
  | { type: "SET_SEAT_FILTERS"; payload: Partial<SeatFilters> };
