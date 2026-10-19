"use client";

import React from "react";
import { AlertTriangle, Building2, IndianRupee, Repeat } from "lucide-react";
import { AdminLoadError, AdminPageSkeleton } from "@/components/layout/common/states";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { formatNumber } from "@/utils/format";
import { money } from "@/features/payments/common/constants";
import { useRevenue } from "@/features/revenue/use-revenue";
import { PlanMixChart, RevenueTrendChart } from "@/features/revenue/components/revenue-charts";
import { RevenueGrowth } from "@/features/revenue/components/revenue-growth";
import { TopOrganizations } from "@/features/revenue/components/top-organizations";
import { RecentPayments } from "@/features/revenue/components/recent-payments";

/** /admin/revenue (superadmin): recurring revenue, collections, plan mix and top customers. */
export function RevenueContent() {
  const { data, error, reload } = useRevenue();

  if (!data && error) {
    return <AdminLoadError title="Couldn't load revenue" message={error} onRetry={() => void reload()} />;
  }
  if (!data) {
    return <AdminPageSkeleton />;
  }
  const { kpis, currency } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Monthly recurring revenue"
          icon={<Repeat />}
          value={money(kpis.mrr, currency)}
          caption={`ARR ${money(kpis.arr, currency)}`}
          tone="primary"
        />
        <KpiCard
          label="Collected this month"
          icon={<IndianRupee />}
          value={money(kpis.collectedThisMonth, currency)}
          badge={<RevenueGrowth value={kpis.collectedGrowthPct} />}
          caption={`Last month ${money(kpis.collectedLastMonth, currency)}`}
          tone="success"
        />
        <KpiCard
          label="Paying organizations"
          icon={<Building2 />}
          value={kpis.payingOrganizations}
          caption={`ARPA ${money(kpis.arpa, currency)} · ${formatNumber(kpis.seatsSold)} seats sold`}
          tone="info"
        />
        <KpiCard
          label="Failed payments · 30d"
          icon={<AlertTriangle />}
          value={kpis.failedPaymentsLast30d}
          caption={`${money(kpis.failedAmountLast30d, currency)} · ${kpis.pendingCheckoutsLast30d} abandoned checkouts`}
          tone={kpis.failedPaymentsLast30d > 0 ? "danger" : "warning"}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <RevenueTrendChart report={data} className="xl:col-span-2" height={280} />
        <PlanMixChart report={data} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Collected · 12 months", value: money(kpis.collectedLast12m, currency) },
          { label: `Refunds · 12 months (${kpis.refundCountLast12m})`, value: money(kpis.refundsLast12m, currency) },
          {
            label: "Yearly billing share",
            value: kpis.mrr > 0 ? `${Math.round((kpis.yearlyMrr / kpis.mrr) * 100)}% of MRR` : "—",
          },
        ].map((t) => (
          <div key={t.label} className={`${GLASS_ROW} px-3 py-2`}>
            <div className="text-xs text-[var(--gy-text-subtle)]">{t.label}</div>
            <div className="text-sm font-semibold text-[var(--gy-text)]">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <TopOrganizations />
        <RecentPayments />
      </div>
    </div>
  );
}
