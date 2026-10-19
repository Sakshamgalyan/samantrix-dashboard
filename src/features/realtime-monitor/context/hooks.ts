import { useContext } from "react";
import { RealtimeMonitorContext } from "@/features/realtime-monitor/context";
import type { RealtimeMonitorContextValue } from "@/features/realtime-monitor/context/types";

export const useRealtimeMonitor = (): RealtimeMonitorContextValue => {
  const context = useContext(RealtimeMonitorContext);
  if (!context) {
    throw new Error(
      "useRealtimeMonitor must be used within a RealtimeMonitorProvider",
    );
  }
  return context;
};

