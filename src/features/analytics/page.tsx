"use client";

import { Link } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Banner,
  Chip,
  ProgressBar,
  Skeleton,
  EmptyState,
}from "@galyan/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Users, Activity, Sparkles, HardDrive, Cpu, Clock, RefreshCw } from "lucide-react";

interface AnalyticsOverview {
  totalMembers: number;
  activeMembers: number;
  seatUtilizationPercent: number;
  featuresEnabledCount: number;
  totalEntitledFeatures: number;
  storageUsedMb: number;
  storageLimitMb: number;
  apiCallsThisMonth: number;
  recentActivity: Array<{
    id: string;
    action: string;
    resource?: string;
    actorEmail?: string;
    createdAt: string;
  }>;
}

const ANALYTICS_ENDPOINT = "/organizations/me/analytics/overview";

function toErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Failed to load analytics telemetry.";
}

interface KpiCardProps {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  value: React.ReactNode;
  footer?: React.ReactNode;
}

function KpiCard({ label, icon, loading, value, footer }: KpiCardProps) {
  return (
    <Card variant="elevated" radius="xl" padding="md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--gy-text-secondary)]">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-3xl font-bold text-[var(--gy-text)]">
        {loading ? <Skeleton width="6rem" height="2.25rem" /> : value}
      </div>
      {footer && <div className="mt-2">{footer}</div>}
    </Card>
  );
}

export default function AnalyticsPage() {
  const { organization } = useAuth();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<AnalyticsOverview>(ANALYTICS_ENDPOINT);
      setData(res);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<AnalyticsOverview>(ANALYTICS_ENDPOINT)
      .then((res) => {
        if (cancelled) return;
        setError(null);
        setData(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const seatPercent = data?.seatUtilizationPercent ?? 0;
  const storageUsedMb = data?.storageUsedMb || 0;
  const featureRatio = data?.totalEntitledFeatures
    ? ((data.featuresEnabledCount || 0) / data.totalEntitledFeatures) * 100
    : 0;
  const recentActivity = data?.recentActivity ?? [];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card variant="elevated" radius="xl" padding="lg">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--gy-text)]">
              {organization?.name ? `${organization.name} analytics` : "Organization analytics"}
            </h2>
            <p className="max-w-2xl text-sm text-[var(--gy-text-secondary)]">
              Storage metrics, seat utilization, and API request traffic aggregated from your
              tenant database.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={fetchAnalytics}
          >
            Refresh
          </Button>
        </div>
      </Card>

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

      {/* Primary Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active members"
          icon={<Users className="size-4 text-[var(--gy-primary)]" />}
          loading={loading}
          value={data?.activeMembers ?? 0}
          footer={
            <p className="text-xs text-[var(--gy-text-secondary)]">
              {data?.totalMembers ?? 0} total provisioned accounts
            </p>
          }
        />

        <KpiCard
          label="Seat utilization"
          icon={<Activity className="size-4 text-[var(--gy-success)]" />}
          loading={loading}
          value={`${seatPercent}%`}
          footer={<ProgressBar progress={seatPercent} size="sm" variant="success" />}
        />

        <KpiCard
          label="Cloud storage"
          icon={<HardDrive className="size-4 text-[var(--gy-warning)]" />}
          loading={loading}
          value={
            storageUsedMb < 1024
              ? `${storageUsedMb} MB`
              : `${(storageUsedMb / 1024).toFixed(1)} GB`
          }
          footer={
            <p className="text-xs text-[var(--gy-text-secondary)]">
              of {((data?.storageLimitMb || 5120) / 1024).toFixed(0)} GB quota
            </p>
          }
        />

        <KpiCard
          label="API invocations"
          icon={<Cpu className="size-4 text-[var(--gy-info)]" />}
          loading={loading}
          value={data?.apiCallsThisMonth ?? 0}
          footer={
            <p className="text-xs text-[var(--gy-text-secondary)]">
              Recorded in the current monthly billing window
            </p>
          }
        />
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Module Adoption */}
        <Card variant="elevated" radius="xl" padding="lg">
          <CardHeader>
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--gy-primary)]" />
                <h3 className="text-base font-semibold text-[var(--gy-text)]">
                  Module & feature adoption
                </h3>
              </div>
              <Chip variant="soft" size="sm">
                {data?.featuresEnabledCount ?? 0} of {data?.totalEntitledFeatures ?? 0} active
              </Chip>
            </div>
          </CardHeader>

          <CardBody className="mt-4">
            <div className="space-y-3 rounded-2xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-4">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-[var(--gy-text-secondary)]">Feature enablement ratio</span>
                  <span className="font-semibold text-[var(--gy-text)]">
                    {Math.round(featureRatio)}%
                  </span>
                </div>
                <ProgressBar progress={Math.min(100, featureRatio)} size="md" variant="gradient" />
              </div>

              <p className="text-xs text-[var(--gy-text-secondary)]">
                Enable advanced modules on the{" "}
                <Link
                  to="/features"
                  className="font-medium text-[var(--gy-primary)] underline underline-offset-2"
                >
                  Feature Management
                </Link>{" "}
                page to empower your team with AI agents and automation.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Tenant Activity Timeline */}
        <Card variant="elevated" radius="xl" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[var(--gy-primary)]" />
              <h3 className="text-base font-semibold text-[var(--gy-text)]">Recent activity</h3>
            </div>
          </CardHeader>

          <CardBody className="mt-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height="3.25rem" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <EmptyState
                size="sm"
                variant="subtle"
                icon={<Clock className="size-6" />}
                title="No activity yet"
                description="No telemetry events recorded yet."
              />
            ) : (
              <div className="divide-y divide-[var(--gy-divider)] overflow-hidden rounded-2xl border border-[var(--gy-border)]">
                {recentActivity.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between gap-4 bg-[var(--gy-surface)] px-4 py-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium capitalize text-[var(--gy-text)]">
                        {act.action.replace(/_/g, " ").toLowerCase()}
                      </p>
                      <p className="truncate text-[var(--gy-text-secondary)]">
                        {act.actorEmail || "System"} {act.resource ? `· ${act.resource}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 tabular-nums text-[var(--gy-text-subtle)]">
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
