import { useContext } from "react";
import { SecurityContext } from "@/features/security/context/index";
import type { SecurityContextValue } from "@/features/security/types/context";

export function useSecurity(): SecurityContextValue {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
}
