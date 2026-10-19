"use client";

import React, { createContext, useReducer, type ReactNode } from "react";
import { ecosystemReducer, initialEcosystemState } from "@/features/ecosystem/context/reducer";
import type { EcosystemContextValue } from "@/features/ecosystem/context/types";

export const EcosystemContext = createContext<EcosystemContextValue | undefined>(
  undefined,
);

export const EcosystemProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(ecosystemReducer, initialEcosystemState);

  return (
    <EcosystemContext.Provider value={{ state, dispatch }}>
      {children}
    </EcosystemContext.Provider>
  );
};

export { useEcosystem } from "@/features/ecosystem/context/hooks";

