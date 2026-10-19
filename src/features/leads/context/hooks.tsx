import { useContext } from "react";
import { LeadsContext } from "@/features/leads/context/index";
import type { LeadsContextType } from "@/features/leads/types";

export const useLeadsContext = (): LeadsContextType => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeadsContext must be used within a LeadsProvider");
  return ctx;
};
