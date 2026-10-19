"use client";

import React from "react";
import { Card, Chip, AnimatedNumber, ProgressBar, Typography, Skeleton } from "@galyan/ui";
import { Users, Sparkles, HardDrive, Radio } from "lucide-react";
import { ICON_TILE } from "@/features/overview/common/constants";
import type { AnalyticsOverview } from "@/features/analytics/types/api";

export interface OrganizationKpisProps {
  analytics?: AnalyticsOverview | null;
  onlineCount: number;
  loading?: boolean;
}

export function OrganizationKpis({ analytics, onlineCount, loading = false }: OrganizationKpisProps) {
  const totalMembers = analytics?.totalMembers ?? 0;
  const activeMembers = analytics?.activeMembers ?? 0;
  const seatUtilization = analytics?.seatUtilizationPercent ?? 0;
  const featuresEnabled = analytics?.featuresEnabledCount ?? 0;
  const featuresEntitled = analytics?.totalEntitledFeatures ?? 0;
  const storageUsedGb = Math.round((analytics?.storageUsedMb ?? 0) / 102.4) / 10;

  if (loading && !analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs">
            <div className="flex items-center justify-between">
              <Skeleton width="40%" height="1rem" />
              <Skeleton width="2rem" height="2rem" variant="rectangular" className="rounded-xl" />
            </div>
            <div className="mt-3">
              <Skeleton width="60%" height="2rem" />
            </div>
            <div className="mt-4">
              <Skeleton width="100%" height="0.5rem" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors">
        <div className="flex items-center justify-between">
          <Typography variant="label" weight="medium" textColor="var(--gy-text-secondary)" className="text-xs uppercase tracking-wider">
            Assigned seats
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]`}>
            <Users className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
            <AnimatedNumber value={totalMembers} />
          </div>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
            / {analytics?.maxMembers ?? 0} seats
          </Typography>
        </div>
        <div className="mt-3">
          <ProgressBar progress={seatUtilization} variant="primary" size="sm" showLabel={false} />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2.5 text-xs block">
          {seatUtilization}% of licensed seats utilized
        </Typography>
      </Card>

      <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors">
        <div className="flex items-center justify-between">
          <Typography variant="label" weight="medium" textColor="var(--gy-text-secondary)" className="text-xs uppercase tracking-wider">
            Live in office now
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-success)]/10 text-[var(--gy-success)]`}>
            <Radio className="size-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-success)]">
            <AnimatedNumber value={Math.max(onlineCount, activeMembers)} />
          </div>
          <Chip variant="success" size="sm">
            Realtime
          </Chip>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
          <div className="h-full bg-[var(--gy-success)] transition-all duration-500" style={{ width: `${Math.min(100, Math.max(15, (onlineCount / (totalMembers || 1)) * 100))}%` }} />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2.5 text-xs block">
          Connected to virtual office rooms via LiveKit
        </Typography>
      </Card>

      <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors">
        <div className="flex items-center justify-between">
          <Typography variant="label" weight="medium" textColor="var(--gy-text-secondary)" className="text-xs uppercase tracking-wider">
            Feature add-ons
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-info)]/10 text-[var(--gy-info)]`}>
            <Sparkles className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
            <AnimatedNumber value={featuresEnabled} />
          </div>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
            / {featuresEntitled} active
          </Typography>
        </div>
        <div className="mt-3">
          <ProgressBar
            progress={Math.round((featuresEnabled / (featuresEntitled || 1)) * 100)}
            variant="gradient"
            size="sm"
            showLabel={false}
          />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2.5 text-xs block">
          AI Summary, Spatial Audio, Screen Sharing enabled
        </Typography>
      </Card>

      <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors">
        <div className="flex items-center justify-between">
          <Typography variant="label" weight="medium" textColor="var(--gy-text-secondary)" className="text-xs uppercase tracking-wider">
            Workspace storage
          </Typography>
          <div className={`${ICON_TILE} bg-[var(--gy-warning)]/10 text-[var(--gy-warning)]`}>
            <HardDrive className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
            <AnimatedNumber value={storageUsedGb} decimals={1} />
          </div>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
            GB used
          </Typography>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
          <div className="h-full bg-[var(--gy-warning)] transition-all duration-500" style={{ width: `${Math.min(100, Math.max(8, storageUsedGb * 10))}%` }} />
        </div>
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2.5 text-xs block truncate">
          Recorded meetings, docs &amp; whiteboard assets
        </Typography>
      </Card>
    </div>
  );
}
