"use client";

import React from "react";
import { Boxes, Database, Radio, Users } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import type { RealtimeGatewayStats } from "@/features/realtime-monitor/types";

interface RealtimeKPIsProps {
  stats?: RealtimeGatewayStats;
  isLoading: boolean;
}

export const RealtimeKPIs = ({ stats, isLoading }: RealtimeKPIsProps) => {
  const connectedClients = stats?.connectedClients ?? 0;
  const activeRooms = stats?.activeRooms ?? 0;
  const officeRooms = stats?.roomBreakdown?.office ?? 0;
  const redisConnected = stats?.redisAdapterConnected ?? false;

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Connected Sockets"
        value={isLoading ? "..." : `${connectedClients} Active`}
        caption="Authenticated WebSocket clients live"
        icon={<Users className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Active Room Channels"
        value={isLoading ? "..." : `${activeRooms} Channels`}
        caption="Offices, orgs, channels & chats"
        icon={<Boxes className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Virtual Office Zones"
        value={isLoading ? "..." : `${officeRooms} Offices`}
        caption="2D/3D workspaces with live players"
        icon={<Radio className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Redis Gateway Adapter"
        value={isLoading ? "..." : redisConnected ? "Multi-Node Ready" : "Single Instance"}
        caption={redisConnected ? "Pub/Sub sync active" : "Local memory adapter"}
        icon={<Database className="size-4" />}
        tone={redisConnected ? "success" : "warning"}
      />
    </div>
  );
}
