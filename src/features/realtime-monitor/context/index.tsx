"use client";

import React, { createContext, useReducer, type ReactNode } from "react";
import { initialRealtimeMonitorState, realtimeMonitorReducer } from "@/features/realtime-monitor/context/reducer";
import type { RealtimeMonitorContextValue } from "@/features/realtime-monitor/context/types";

export const RealtimeMonitorContext = createContext<
  RealtimeMonitorContextValue | undefined
>(undefined);

export const RealtimeMonitorProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    realtimeMonitorReducer,
    initialRealtimeMonitorState,
  );

  return (
    <RealtimeMonitorContext.Provider value={{ state, dispatch }}>
      {children}
    </RealtimeMonitorContext.Provider>
  );
};

export { useRealtimeMonitor } from "@/features/realtime-monitor/context/hooks";

