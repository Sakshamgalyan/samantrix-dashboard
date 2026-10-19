"use client";

import React from "react";
import { Banner, Card, Chip, EmptyState, Skeleton, Typography } from "@galyan/ui";
import { Layers, Workflow } from "lucide-react";
import { useQueues } from "@/features/queues/context";
import { useGetQueueMetricsQuery } from "@/features/queues/context/api";
import { QueuesHeader } from "@/features/queues/components/queues-header";
import { QueuesKPIs } from "@/features/queues/components/queues-kpis";
import { QueueCard } from "@/features/queues/components/queue-card";

export const QueuesContent = () => {
  const { state } = useQueues();
  const { autoRefresh, refreshIntervalSec } = state;

  const {
    data: queues = [],
    isLoading,
    error,
  } = useGetQueueMetricsQuery(undefined, {
    pollingInterval: autoRefresh ? refreshIntervalSec * 1000 : 0,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <QueuesHeader />

      {/* Disconnection Warning */}
      {error && (
        <Banner
          variant="danger"
          title="BullMQ Service Unavailable"
          description="Could not query BullMQ metrics from simantrix-backend. Ensure the Redis server (port 6379) and NestJS backend are online."
        />
      )}

      {/* KPIs */}
      <QueuesKPIs queues={queues} isLoading={isLoading} />

      {/* Queues Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl bg-[var(--gy-bg-elevated)]" />
          ))}
        </div>
      ) : queues.length === 0 ? (
        <Card variant="glass" radius="lg" className="p-8 text-center">
          <EmptyState
            icon={<Layers className="size-8 text-[var(--gy-text-subtle)] mx-auto" />}
            title="No Active Queues"
            description="No background BullMQ queues are currently registered with the worker supervisor."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queues.map((queue) => (
            <QueueCard key={queue.name} queue={queue} />
          ))}
        </div>
      )}

      {/* Worker Specifications Guide */}
      <Card variant="glass" radius="lg" className="p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--gy-border)]/60">
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-[var(--gy-warning)]" />
            <Typography variant="p" className="font-semibold text-[var(--gy-text)] text-sm">
              BullMQ Worker Specifications & Job Registry
            </Typography>
          </div>
          <Chip variant="soft" size="sm" className="text-xs">
            Redis Concurrency: 5 workers/queue
          </Chip>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[var(--gy-border)] bg-[var(--gy-bg-elevated)]/60 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-[var(--gy-text)]">
              <span className="uppercase text-[var(--gy-warning)] tracking-wider text-[11px]">Mail Queue Jobs</span>
              <Chip variant="outline" size="sm" className="font-mono text-[10px]">
                3 Retries (Exp Backoff)
              </Chip>
            </div>
            <p className="text-[var(--gy-text-secondary)] text-[11px]">
              Processes: <code className="text-[var(--gy-text)] font-semibold">send-raw-email</code>, <code className="text-[var(--gy-text)] font-semibold">send-verification-email</code>, <code className="text-[var(--gy-text)] font-semibold">send-password-reset-code</code>, <code className="text-[var(--gy-text)] font-semibold">send-contact-notification</code>, <code className="text-[var(--gy-text)] font-semibold">send-waitlist-confirmation</code>.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-[var(--gy-border)] bg-[var(--gy-bg-elevated)]/60 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-[var(--gy-text)]">
              <span className="uppercase text-[var(--gy-primary)] tracking-wider text-[11px]">System Queue Jobs</span>
              <Chip variant="outline" size="sm" className="font-mono text-[10px]">
                2 Retries (Fixed 5s)
              </Chip>
            </div>
            <p className="text-[var(--gy-text-secondary)] text-[11px]">
              Processes: <code className="text-[var(--gy-text)] font-semibold">provision-workspace</code>, <code className="text-[var(--gy-text)] font-semibold">reconcile-workspaces</code>, <code className="text-[var(--gy-text)] font-semibold">reconcile-expired-trials</code>, <code className="text-[var(--gy-text)] font-semibold">cleanup-stale-payments</code>, <code className="text-[var(--gy-text)] font-semibold">purge-security-artifacts</code>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

