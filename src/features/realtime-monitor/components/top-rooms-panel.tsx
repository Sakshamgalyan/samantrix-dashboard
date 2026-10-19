"use client";

import React from "react";
import { Card, Chip, Typography } from "@galyan/ui";
import { Boxes, Building2, MessageSquare, Radio, Users, Video } from "lucide-react";
import type { RealtimeGatewayStats, TopRoom } from "@/features/realtime-monitor/types";
import { GLASS_ROW } from "@/components/layout/common/glass";

interface TopRoomsPanelProps {
  stats?: RealtimeGatewayStats;
}

export const TopRoomsPanel = ({ stats }: TopRoomsPanelProps) => {
  const breakdown = stats?.roomBreakdown ?? {
    office: 0,
    org: 0,
    conversation: 0,
    meeting: 0,
    user: 0,
  };

  const topRooms: TopRoom[] = stats?.topRooms ?? [];

  const getRoomIcon = (type: string) => {
    switch (type) {
      case "office":
        return <Radio className="size-3.5 text-[var(--gy-primary)]" />;
      case "org":
        return <Building2 className="size-3.5 text-[var(--gy-info)]" />;
      case "conversation":
        return <MessageSquare className="size-3.5 text-cyan-500" />;
      case "meeting":
        return <Video className="size-3.5 text-[var(--gy-success)]" />;
      default:
        return <Boxes className="size-3.5 text-[var(--gy-text-subtle)]" />;
    }
  };

  return (
    <Card variant="glass" radius="lg" className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--gy-border)]/60">
        <div className="flex items-center gap-2">
          <Boxes className="size-4 text-[var(--gy-primary)] shrink-0" />
          <Typography variant="p" className="font-semibold text-[var(--gy-text)] text-sm">
            Active Room Distribution & Channels
          </Typography>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Chip variant="soft" size="sm" className="text-xs">
            {breakdown.office} Offices
          </Chip>
          <Chip variant="soft" size="sm" className="text-xs">
            {breakdown.meeting} Meetings
          </Chip>
          <Chip variant="soft" size="sm" className="text-xs">
            {breakdown.conversation} Chats
          </Chip>
        </div>
      </div>

      <div className="mt-3">
        {topRooms.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--gy-text-subtle)]">
            No active room channels occupied at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {topRooms.map((room) => (
              <div
                key={room.name}
                className={`${GLASS_ROW} p-2.5 flex items-center justify-between`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className="p-1 rounded bg-[var(--gy-bg-elevated)] border border-[var(--gy-border)]/60">
                    {getRoomIcon(room.type)}
                  </div>
                  <div className="truncate">
                    <span className="font-mono text-xs text-[var(--gy-text)] truncate block">
                      {room.name}
                    </span>
                    <span className="text-[10px] text-[var(--gy-text-subtle)] uppercase tracking-wider">
                      {room.type} channel
                    </span>
                  </div>
                </div>

                <Chip variant="primary" size="sm" className="text-xs shrink-0">
                  <Users className="size-3 mr-1" />
                  {room.memberCount}
                </Chip>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
