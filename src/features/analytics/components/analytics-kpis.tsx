"use client";

import React from "react";
import { AnimatedNumber, Card, ProgressBar, Skeleton, Typography } from "@galyan/ui";
import { Users, Activity, HardDrive, Cpu } from "lucide-react";
import type { AnalyticsOverview } from "@/features/analytics/types/api";

export interface AnalyticsKpisProps {
  data?: AnalyticsOverview | null;
  loading: boolean;
}

const ICON_TILE = "grid size-8 sm:size-9 place-items-center rounded-xl shrink-0";

export function AnalyticsKpis({ data, loading }: AnalyticsKpisProps) {
  const seatPercent = data?.seatUtilizationPercent ?? 0;
  const storageUsedMb = data?.storageUsedMb || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Metric 1: Active members */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs uppercase tracking-wider truncate"
          >
            Active members
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]`}>
            <Users className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
          {loading ? (
            <Skeleton width="4rem" height="2rem" />
          ) : (
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
              <AnimatedNumber value={data?.activeMembers ?? 0} />
            </div>
          )}
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
            users
          </Typography>
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block truncate">
          {data?.totalMembers ?? 0} total provisioned accounts
        </Typography>
      </Card>

      {/* Metric 2: Seat utilization */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs uppercase tracking-wider truncate"
          >
            Seat utilization
          </Typography>
          <div className={`${ICON_TILE} bg-emerald-500/10 text-emerald-500`}>
            <Activity className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
          {loading ? (
            <Skeleton width="4rem" height="2rem" />
          ) : (
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">
              <AnimatedNumber value={seatPercent} />%
            </div>
          )}
        </div>
        <div className="mt-2.5">
          <ProgressBar progress={seatPercent} size="sm" variant="success" showLabel={false} />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
          Current license usage ratio
        </Typography>
      </Card>

      {/* Metric 3: Cloud storage */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs uppercase tracking-wider truncate"
          >
            Cloud storage
          </Typography>
          <div className={`${ICON_TILE} bg-amber-500/10 text-amber-500`}>
            <HardDrive className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
          {loading ? (
            <Skeleton width="4rem" height="2rem" />
          ) : (
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600">
              {storageUsedMb < 1024
                ? `${storageUsedMb} MB`
                : `${(storageUsedMb / 1024).toFixed(1)} GB`}
            </div>
          )}
        </div>
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, (storageUsedMb / 5120) * 100))}%` }}
          />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block truncate">
          Uploaded media &amp; documents
        </Typography>
      </Card>

      {/* Metric 4: API invocations */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <Typography
            variant="label"
            weight="medium"
            textColor="var(--gy-text-secondary)"
            className="text-xs uppercase tracking-wider truncate"
          >
            API invocations
          </Typography>
          <div className={`${ICON_TILE} bg-indigo-500/10 text-indigo-500`}>
            <Cpu className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
            Active
          </div>
        </div>
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
          <div className="h-full bg-indigo-500 w-1/3 transition-all duration-500" />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block truncate">
          Gateway metering operational
        </Typography>
      </Card>
    </div>
  );
}
