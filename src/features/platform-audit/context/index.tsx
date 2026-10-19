"use client";

import React, { createContext, useReducer, type ReactNode } from "react";
import { initialPlatformAuditState, platformAuditReducer } from "@/features/platform-audit/context/reducer";
import type { PlatformAuditContextValue } from "@/features/platform-audit/context/types";

export const PlatformAuditContext = createContext<
  PlatformAuditContextValue | undefined
>(undefined);

export const PlatformAuditProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    platformAuditReducer,
    initialPlatformAuditState,
  );

  return (
    <PlatformAuditContext.Provider value={{ state, dispatch }}>
      {children}
    </PlatformAuditContext.Provider>
  );
};

export * from "@/features/platform-audit/context/hooks";
