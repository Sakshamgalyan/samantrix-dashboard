"use client";

import React from "react";
import Link from "next/link";
import { Button, Banner, Card, Chip, Typography } from "@galyan/ui";
import { Activity, ArrowRight, RotateCw } from "lucide-react";
import { queryErrorMessage } from "@/store";
import { useAuth } from "@/features/auth";
import { pageParams } from "@/features/common/pagination";
import { useGetOrgAuditLogsQuery } from "@/features/audit-logs/context/api";
import { useGetOrgAnalyticsOverviewQuery } from "@/features/analytics/context/api";
import { AnalyticsKpis } from "@/features/analytics/components/analytics-kpis";
import { AnalyticsModuleAdoption } from "@/features/analytics/components/analytics-module-adoption";
import { AnalyticsRecentActivity } from "@/features/analytics/components/analytics-recent-activity";
import { AnalyticsShortcuts } from "@/features/analytics/components/analytics-shortcuts";

export function AnalyticsContent() {
  const { organization } = useAuth();
  const query = useGetOrgAnalyticsOverviewQuery();
  const data = query.data ?? null;
  const loading = query.isLoading;
  const isFetching = query.isFetching;
  const error = query.isError ? queryErrorMessage(query.error, "Failed to load analytics telemetry.") : null;

  const activityQuery = useGetOrgAuditLogsQuery(pageParams(1));
  const recentActivity = activityQuery.data?.data ?? [];
  const activityLoading = activityQuery.isLoading;
  const isActivityFetching = activityQuery.isFetching;

  const isRefreshing = isFetching || isActivityFetching;

  const fetchAnalytics = () => {
    void query.refetch();
    void activityQuery.refetch();
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Banner
          variant="danger"
          title="Couldn't load analytics"
          description={error}
          button={
            <Button variant="danger-soft" size="sm" onClick={fetchAnalytics}>
              Retry
            </Button>
          }
        />
      )}

      {/* Hero Header Card */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm">
                Telemetry &amp; Usage Stream
              </Chip>
              <Chip variant="primary" size="sm">
                Realtime Health
              </Chip>
              <Chip variant="neutral" size="sm">
                {data?.activeMembers ?? 0} active members
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Workspace Analytics &amp; Health
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Real-time telemetry, license seat utilization, cloud storage quotas,
              module adoption rates, and administrative audit streams.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
              disabled={isRefreshing}
              onClick={fetchAnalytics}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              href="/organization/audit-logs"
              as={Link}
              rightIcon={<ArrowRight className="size-3.5" />}
              className="flex-1 sm:flex-initial"
            >
              Audit Stream
            </Button>
          </div>
        </div>
      </Card>

      {/* Primary Metrics Grid */}
      <AnalyticsKpis data={data} loading={loading} />

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsModuleAdoption data={data} />
        <AnalyticsRecentActivity activity={recentActivity} loading={activityLoading} />
      </div>

      {/* Quick Management Shortcuts */}
      <AnalyticsShortcuts />
    </div>
  );
}
