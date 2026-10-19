import type {
  PaymentFilters,
  PaymentsConfig,
  PaymentsListResponse,
  PaymentsSummary,
  Plan,
  SeatFilters,
  SeatsResponse,
} from "@/features/payments/types/api";

/** UI-only state kept in the reducer; server data lives in the RTK Query cache. */
export interface PaymentsUiState {
  filters: PaymentFilters;
  seatFilters: SeatFilters;
}

/** What components read: the UI state composed with the cached queries. */
export interface PaymentsPageState {
  summary: PaymentsSummary | null;
  payments: PaymentsListResponse | null;
  seats: SeatsResponse | null;
  plans: Plan[];
  config: PaymentsConfig | null;
  filters: PaymentFilters;
  seatFilters: SeatFilters;
  loading: boolean;
  error: string | null;
}
