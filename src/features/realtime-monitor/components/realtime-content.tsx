"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Banner } from "@galyan/ui";
import { useRealtimeMonitor } from "@/features/realtime-monitor/context";
import { useGetRealtimeGatewayStatsQuery } from "@/features/realtime-monitor/context/api";
import { RealtimeHeader } from "@/features/realtime-monitor/components/realtime-header";
import { RealtimeKPIs } from "@/features/realtime-monitor/components/realtime-kpis";
import { TopRoomsPanel } from "@/features/realtime-monitor/components/top-rooms-panel";
import { ConnectedSocketsTable } from "@/features/realtime-monitor/components/connected-sockets-table";

const BroadcastModal = dynamic(
  () => import("@/features/realtime-monitor/components/broadcast-modal").then((m) => m.BroadcastModal),
  { ssr: false },
);

export const RealtimeContent = () => {
  const { state } = useRealtimeMonitor();
  const { autoRefresh } = state;

  const {
    data: stats,
    isLoading,
    error,
  } = useGetRealtimeGatewayStatsQuery(undefined, {
    pollingInterval: autoRefresh ? 10_000 : 0,
  });

  return (
    <div className="space-y-4">
      {/* Header with Broadcast */}
      <RealtimeHeader />

      {/* Disconnection Warning */}
      {error && (
        <Banner
          variant="danger"
          title="Realtime Gateway Unreachable"
          description="Could not query WebSocket server statistics from simantrix-backend. Ensure the NestJS server is running."
        />
      )}

      {/* Real-time KPIs */}
      <RealtimeKPIs stats={stats} isLoading={isLoading} />

      {/* Top Active Rooms Distribution */}
      <TopRoomsPanel stats={stats} />

      {/* Connected Sockets Table */}
      <ConnectedSocketsTable
        sockets={stats?.connectedSockets ?? []}
        isLoading={isLoading}
      />

      {/* Broadcast Announcement Modal */}
      <BroadcastModal />
    </div>
  );
};

