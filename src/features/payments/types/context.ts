import type { ManualPaymentInput, PaymentFilters, PlanCreateInput, PlanTier, PlanUpdateInput, SeatFilters } from "@/features/payments/types/api";
import type { PaymentsPageState } from "@/features/payments/types/state";

export interface PaymentsContextType {
  state: PaymentsPageState;
  setFilters: (filters: Partial<PaymentFilters>) => void;
  setSeatFilters: (filters: Partial<SeatFilters>) => void;
  reload: () => Promise<void>;
  recordManualPayment: (input: ManualPaymentInput) => Promise<{ invoiceNumber: string | null }>;
  refundPayment: (paymentId: string, amount: number | undefined, reason: string) => Promise<void>;
  updatePlan: (planTier: PlanTier, input: PlanUpdateInput) => Promise<void>;
  createPlan: (input: PlanCreateInput) => Promise<void>;
}
