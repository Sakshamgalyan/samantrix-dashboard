"use client";

import { memo } from "react";
import Link from "next/link";
import { Skeleton } from "@galyan/ui";
import { ArrowUpRight, Building2, Inbox, Radio, Repeat, Target, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { useAuth } from "@/features/auth";
import { formatNumber } from "@/utils/format";
import { money } from "@/features/payments/common/constants";
import { PlanMixChart, RevenueTrendChart } from "@/features/revenue/components/revenue-charts";
import { useAdminOverview } from "@/features/overview/admin/use-admin-overview";
import { ActivityFeed, GrowthPanel, LeadsPanel, LiveChip, TrackerPanel } from "@/features/overview/admin/panels";
import type { AdminOverviewData } from "@/features/overview/admin/types";

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function OverviewSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height="36px" width="40%" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="92px" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Skeleton height="300px" className="xl:col-span-2" />
        <Skeleton height="300px" />
      </div>
    </div>
  );
}

const Kpis = memo(function Kpis({ data }: { data: AdminOverviewData }) {
  const leads = data.leads;
  const orgs = data.organizations;
  const sessions = data.platform?.sessions;
  const won = leads?.byStatus?.WON ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <KpiCard
        label="New leads · 7 days"
        icon={<Inbox />}
        value={leads?.newLast7d ?? leads?.newThisWeek ?? 0}
        caption={leads ? `${formatNumber(leads.newLast30d ?? 0)} this month · ${formatNumber(leads.awaitingFollowUp ?? 0)} awaiting follow-up` : "—"}
        tone="info"
      />
      <KpiCard
        label="Lead conversion"
        icon={<Target />}
        value={leads?.rates?.conversionRate != null ? `${leads.rates.conversionRate}%` : "—"}
        caption={
          leads
            ? `${won} won${leads.value?.openPipeline ? ` · ${money(leads.value.openPipeline, leads.value.currency ?? "INR")} open pipeline` : ""}`
            : undefined
        }
        tone="success"
      />
      <KpiCard
        label="Organizations"
        icon={<Building2 />}
        value={orgs?.total ?? 0}
        caption={orgs ? `+${orgs.newLast30d} in 30 days · ${orgs.trial} on trial` : undefined}
        tone="primary"
      />
      <KpiCard
        label="Online now"
        icon={<Radio />}
        value={sessions?.activeNow ?? 0}
        caption={sessions ? `${formatNumber(sessions.signInsLast30d ?? 0)} sign-ins in 30 days` : undefined}
        tone="warning"
      />
    </div>
  );
});

const RevenueSection = memo(function RevenueSection({ data }: { data: AdminOverviewData }) {
  const report = data.revenue;
  if (!report || !report.kpis) return null;
  const k = report.kpis;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--gy-text)]">
          <TrendingUp className="size-4 text-[var(--gy-success)]" /> Revenue
        </h2>
        <Link href="/admin/revenue" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--gy-primary)] hover:underline">
          Full report <ArrowUpRight className="size-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard label="MRR" icon={<Repeat />} value={money(k.mrr, report.currency)} caption={`ARR ${money(k.arr, report.currency)}`} tone="primary" />
        <KpiCard
          label="Collected this month"
          icon={<TrendingUp />}
          value={money(k.collectedThisMonth, report.currency)}
          caption={`Last month ${money(k.collectedLastMonth, report.currency)}${k.collectedGrowthPct != null ? ` · ${k.collectedGrowthPct >= 0 ? "+" : ""}${k.collectedGrowthPct}%` : ""}`}
          tone="success"
        />
        <KpiCard label="Paying organizations" icon={<Building2 />} value={k.payingOrganizations} caption={`ARPA ${money(k.arpa, report.currency)}`} tone="info" />
        <KpiCard label="Seats sold" icon={<Target />} value={k.seatsSold} caption={`${k.trialingOrganizations} organizations on trial`} tone="warning" />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <RevenueTrendChart report={report} className="xl:col-span-2" height={200} compact />
        <PlanMixChart report={report} />
      </div>
    </section>
  );
});

/** Developer-console home: leads, a to-do tracker, growth and (for superadmins) revenue. No tables. */
export function AdminOverview() {
  const { user } = useAuth();
  const { data } = useAdminOverview();

  if (!data) return <OverviewSkeleton />;
  const firstName = (user?.fullName || user?.name || "").split(" ")[0];

  return (
    <div className="space-y-4 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[var(--gy-text)]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p suppressHydrationWarning className="text-xs text-[var(--gy-text-secondary)]">
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · here is what is happening across Simantrix
          </p>
        </div>
        <LiveChip label={`Updated ${new Date(data.loadedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`} />
      </div>

      <Kpis data={data} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <LeadsPanel data={data} className="xl:col-span-2" />
        <TrackerPanel data={data} />
      </div>

      <RevenueSection data={data} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <GrowthPanel data={data} />
        <ActivityFeed data={data} />
      </div>
    </div>
  );
}
