"use client";

import React from "react";
import { Clock, Database, KeyRound, ShieldAlert } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import type { PlatformAuditSummary } from "@/features/platform-audit/types";

interface PlatformAuditKPIsProps {
  summary?: PlatformAuditSummary;
  isLoading: boolean;
}

const formatActionName = (action?: string) => {
  if (!action) return "User Login";
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const PlatformAuditKPIs = ({
  summary,
  isLoading,
}: PlatformAuditKPIsProps) => {
  const totalLogs = summary?.totalLogs ?? 0;
  const todayLogs = summary?.todayLogs ?? 0;
  const topAction = summary?.topActions?.[0];

  const primaryCategory = summary?.categoryDistribution
    ? Object.entries(summary.categoryDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Security & Auth"
    : "Security & Auth";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard
        label="Lifetime Audit Logs"
        value={isLoading ? "..." : `${totalLogs.toLocaleString()} Records`}
        caption="Appended across all organizations"
        icon={<Database className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Recorded Today"
        value={isLoading ? "..." : `${todayLogs.toLocaleString()} Events`}
        caption="Today's security and system traffic"
        icon={<Clock className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Primary Category"
        value={
          isLoading ? (
            "..."
          ) : (
            <span className="text-base sm:text-lg font-semibold truncate block max-w-full">
              {formatActionName(primaryCategory)}
            </span>
          )
        }
        caption="Most frequent audit namespace"
        icon={<ShieldAlert className="size-4" />}
        tone="warning"
      />
      <KpiCard
        label="Dominant Action"
        value={
          isLoading ? (
            "..."
          ) : (
            <span
              className="text-base sm:text-lg font-semibold truncate block max-w-full"
              title={topAction?.action}
            >
              {topAction ? formatActionName(topAction.action) : "User Login"}
            </span>
          )
        }
        caption={topAction ? `${topAction.count} events logged` : "Sign-in and session events"}
        icon={<KeyRound className="size-4" />}
        tone="primary"
      />
    </div>
  );
};
