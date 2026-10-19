import { useContext } from "react";
import { EcosystemContext } from "@/features/ecosystem/context";
import type { EcosystemContextValue } from "@/features/ecosystem/context/types";

export const useEcosystem = (): EcosystemContextValue => {
  const context = useContext(EcosystemContext);
  if (!context) {
    throw new Error("useEcosystem must be used within an EcosystemProvider");
  }
  return context;
};

