"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import type { QueueMetrics } from "@/features/queues/types";

interface QueuesKPIsProps {
  queues: QueueMetrics[];
  isLoading: boolean;
}

export const QueuesKPIs = ({ queues, isLoading }: QueuesKPIsProps) => {
  const totalActive = queues.reduce((acc, q) => acc + (q.active || 0), 0);
  const totalWaiting = queues.reduce((acc, q) => acc + (q.waiting || 0), 0);
  const totalCompleted = queues.reduce((acc, q) => acc + (q.completed || 0), 0);
  const totalFailed = queues.reduce((acc, q) => acc + (q.failed || 0), 0);

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Active Processing"
        value={isLoading ? "..." : `${totalActive} Jobs`}
        caption="Workers currently executing tasks"
        icon={<PlayCircle className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Queued Waiting"
        value={isLoading ? "..." : `${totalWaiting} Jobs`}
        caption="Pending worker pickup in Redis"
        icon={<Clock className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Processed Successfully"
        value={isLoading ? "..." : `${totalCompleted} Completed`}
        caption="All-time completed task receipts"
        icon={<CheckCircle2 className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Failed / Dead-Letter"
        value={isLoading ? "..." : `${totalFailed} Failed`}
        caption={totalFailed === 0 ? "Clean queue execution" : "Requires retry or purge"}
        icon={<AlertCircle className="size-4" />}
        tone={totalFailed > 0 ? "danger" : "warning"}
      />
    </div>
  );
}
