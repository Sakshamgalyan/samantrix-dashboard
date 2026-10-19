"use client";

import React, { createContext, useContext } from "react";

export type ConsoleScope = "admin" | "workspace";

export interface DashboardOutletContext {
  scope: ConsoleScope;
  changeScope: (scope: ConsoleScope) => void;
  canSwitchScope: boolean;
}

const ScopeContext = createContext<DashboardOutletContext>({
  scope: "workspace",
  changeScope: () => {},
  canSwitchScope: false,
});

export function ScopeProvider({
  value,
  children,
}: {
  value: DashboardOutletContext;
  children: React.ReactNode;
}) {
  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useDashboardScope(): DashboardOutletContext {
  return useContext(ScopeContext);
}

export function useConsoleScope(): ConsoleScope {
  return useDashboardScope().scope;
}

