"use client";

import React from "react";
import { RealtimeMonitorProvider } from "@/features/realtime-monitor/context";
import { RealtimeContent } from "@/features/realtime-monitor/components/realtime-content";

export const RealtimeMonitorPage = () => {
  return (
    <RealtimeMonitorProvider>
      <RealtimeContent />
    </RealtimeMonitorProvider>
  );
};

export default RealtimeMonitorPage;

