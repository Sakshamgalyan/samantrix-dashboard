"use client";

import React from "react";
import { Button, Chip } from "@galyan/ui";
import { Megaphone } from "lucide-react";
import { AdminHero } from "@/components/layout/common/hero";
import { useRealtimeMonitor } from "@/features/realtime-monitor/context";
import { openBroadcastModalAction } from "@/features/realtime-monitor/context/action";

export const RealtimeHeader = () => {
  const { state, dispatch } = useRealtimeMonitor();
  const { autoRefresh } = state;

  return (
    <AdminHero
      title="Realtime Gateway & WebSockets"
      description="Live socket connections, room occupancy channels, and global workplace announcement broadcast."
      chips={
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip
            variant="success"
            size="sm"
            icon={<span className="size-1.5 rounded-full bg-[var(--gy-success)] animate-pulse" />}
          >
            Socket.IO 4.8 Active
          </Chip>
          <Chip variant="soft" size="sm">
            Event Mesh Connected
          </Chip>
          <Chip
            variant="neutral"
            size="sm"
            icon={
              <span
                className={`size-1.5 rounded-full ${
                  autoRefresh ? "bg-[var(--gy-success)] animate-pulse" : "bg-[var(--gy-text-subtle)]"
                }`}
              />
            }
          >
            {autoRefresh ? "Live Stream (10s)" : "Stream Paused"}
          </Chip>
        </div>
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch(openBroadcastModalAction())}
          className="text-xs"
        >
          <Megaphone className="size-3.5 mr-1.5 text-[var(--gy-warning)]" />
          Broadcast Alert
        </Button>
      }
    />
  );
};
