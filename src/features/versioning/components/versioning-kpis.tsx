"use client";

import React from "react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { formatNumber } from "@/utils/format";
import { CalendarClock, CheckCircle2, Gauge, Laptop, Undo2 } from "lucide-react";
import { useVersioningContext } from "@/features/versioning/context";

export const VersioningKpis = () => {
  const { summary } = useVersioningContext();
  if (!summary) return null;

  const desktopCount = summary.byApp?.DESKTOP ?? 0;
  const stableRelease = summary.current.find(
    (r) => r.app === "DESKTOP" && r.channel === "STABLE",
  );
  const desktopRolling = summary.rollingOut.filter((r) => r.app === "DESKTOP");
  const activeRollout = desktopRolling[0];

  const rollingCaption = activeRollout
    ? `v${activeRollout.version} · ${activeRollout.channel} channel`
    : "no active desktop rollouts";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Production Stable Release"
        value={stableRelease ? `v${stableRelease.version}` : "None Live"}
        caption={stableRelease ? "Desktop Live Channel · 100% rollout" : "no live desktop release"}
        icon={<Laptop className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Active Canary Rollout"
        value={activeRollout ? `${activeRollout.rolloutPercent}%` : "0%"}
        caption={rollingCaption}
        icon={<Gauge className="size-4" />}
        tone="warning"
      />
      <KpiCard
        label="Deployed (Last 30 Days)"
        value={summary.releasedLast30Days}
        caption={`shipped · ${formatNumber(summary.createdLast30Days)} drafts staged`}
        icon={<CalendarClock className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Rolled Back / Downgraded"
        value={summary.counts.ROLLED_BACK}
        caption={`of ${formatNumber(desktopCount)} desktop versions tracked`}
        icon={<Undo2 className="size-4" />}
        tone="danger"
      />
    </div>
  );
};
