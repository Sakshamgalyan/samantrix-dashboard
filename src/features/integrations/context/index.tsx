"use client";

import { createContext, useReducer, type ReactNode } from "react";
import type { IntegrationsContextValue } from "@/features/integrations/types/context";
import { initialIntegrationsState, integrationsReducer } from "@/features/integrations/context/reducer";

export const IntegrationsContext = createContext<IntegrationsContextValue | undefined>(undefined);

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(integrationsReducer, initialIntegrationsState);

  return (
    <IntegrationsContext.Provider value={{ state, dispatch }}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export * from "@/features/integrations/context/hooks";
export * from "@/features/integrations/context/action";
export * from "@/features/integrations/context/reducer";
export * from "@/features/integrations/context/api";
