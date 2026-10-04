"use client";

import { Building2, CalendarClock, DollarSign, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { money } from "../common/constants";
import { usePaymentsContext } from "../context";

/** MRR · ARR · paying organizations · past due (with trialing). */
export function RevenueKpis() {
  const { state } = usePaymentsContext();
  if (!state.data) return null;
  const { revenue, organizations, currency } = state.data;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Monthly recurring revenue"
        value={money(revenue.mrr, currency)}
        caption="Active + past-due plans, yearly ÷ 12"
        icon={<DollarSign className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Annual run rate"
        value={money(revenue.arr, currency)}
        caption={`MRR × 12 · ${money(revenue.collectedLast12m, currency)} collected in 12 months`}
        icon={<TrendingUp className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Paying organizations"
        value={revenue.payingOrganizations}
        caption={`of ${formatNumber(organizations.total)} organization${organizations.total === 1 ? "" : "s"} on the platform`}
        icon={<Building2 className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Past due"
        value={revenue.pastDueSubscriptions}
        caption={`${formatNumber(revenue.trialingOrganizations)} on trial · ${formatNumber(revenue.cancelingAtPeriodEnd)} canceling at period end`}
        icon={<CalendarClock className="size-4" />}
        tone={revenue.pastDueSubscriptions > 0 ? "danger" : "warning"}
      />
    </div>
  );
}
