"use client";

import React from "react";
import { Chip } from "@galyan/ui";
import { AdminHero } from "@/components/layout/common/hero";
import { useQueues } from "@/features/queues/context";

export const QueuesHeader = () => {
  const { state } = useQueues();
  const { autoRefresh, refreshIntervalSec } = state;

  return (
    <AdminHero
      title="Background Queues & BullMQ Workers"
      description="Inspect async job pipelines: email delivery, tenant workspace provisioning, and scheduled cleanup workers."
      chips={
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip
            variant="warning"
            size="sm"
            icon={<span className="size-1.5 rounded-full bg-[var(--gy-warning)] animate-pulse" />}
          >
            Redis Backed
          </Chip>
          <Chip variant="soft" size="sm">
            BullMQ Supervisor
          </Chip>
          <Chip
            variant="neutral"
            size="sm"
            icon={
              <span
                className={`size-1.5 rounded-full ${
                  autoRefresh ? "bg-[var(--gy-warning)] animate-pulse" : "bg-[var(--gy-text-subtle)]"
                }`}
              />
            }
          >
            {autoRefresh ? `Auto-Polling (${refreshIntervalSec}s)` : "Polling Paused"}
          </Chip>
        </div>
      }
    />
  );
};
