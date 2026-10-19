import { useContext } from "react";
import { PaymentsContext } from "@/features/payments/context/index";
import type { PaymentsContextType } from "@/features/payments/types";

export const usePaymentsContext = (): PaymentsContextType => {
  const context = useContext(PaymentsContext);
  if (!context) throw new Error("usePaymentsContext must be used within a PaymentsProvider");
  return context;
};
