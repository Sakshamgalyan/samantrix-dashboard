"use client";

import { createContext, useReducer, type ReactNode } from "react";
import type { SecurityContextValue } from "@/features/security/types/context";
import { initialSecurityState, securityReducer } from "@/features/security/context/reducer";

export const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(securityReducer, initialSecurityState);

  return (
    <SecurityContext.Provider value={{ state, dispatch }}>
      {children}
    </SecurityContext.Provider>
  );
}

export { useSecurity } from "@/features/security/context/hooks";
