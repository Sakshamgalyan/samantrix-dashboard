"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { AuditLogsContextValue } from "@/features/audit-logs/types/context";
import { initialAuditLogsState, auditLogsReducer } from "@/features/audit-logs/context/reducer";

export * from "@/features/audit-logs/context/api";

const AuditLogsContext = createContext<AuditLogsContextValue | undefined>(undefined);

export function AuditLogsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(auditLogsReducer, initialAuditLogsState);

  return (
    <AuditLogsContext.Provider value={{ state, dispatch }}>
      {children}
    </AuditLogsContext.Provider>
  );
}

export function useAuditLogs(): AuditLogsContextValue {
  const context = useContext(AuditLogsContext);
  if (!context) {
    throw new Error("useAuditLogs must be used within an AuditLogsProvider");
  }
  return context;
}
