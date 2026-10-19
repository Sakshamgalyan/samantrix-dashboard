"use client";

import { Activity, Eye, Percent, UserPlus, Users } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { formatNumber } from "@/utils/format";
import { useMarketingContext } from "@/features/marketing-analytics/context";
import { ChangeBadge } from "@/features/marketing-analytics/components/change-badge";

/** Visitors, sessions, page views, leads and conversion for the window, each vs the previous one. */
export const MarketingKpis = () => {
  const { state } = useMarketingContext();
  const report = state.report;
  if (!report) return null;
  const { totals, previous, change, leadsByType } = report;
  const before = (value: string) => `${value} previous period`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      <KpiCard
        label="Visitors"
        value={totals.uniqueVisitors}
        badge={<ChangeBadge value={change.uniqueVisitors} />}
        caption={before(formatNumber(previous.uniqueVisitors))}
        icon={<Users className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Sessions"
        value={totals.sessions}
        badge={<ChangeBadge value={change.sessions} />}
        caption={before(formatNumber(previous.sessions))}
        icon={<Activity className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Page views"
        value={totals.visits}
        badge={<ChangeBadge value={change.visits} />}
        caption={
          totals.sessions > 0
            ? `${(totals.visits / totals.sessions).toFixed(1)} pages per session`
            : before(formatNumber(previous.visits))
        }
        icon={<Eye className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Leads"
        value={totals.leads}
        badge={<ChangeBadge value={change.leads} />}
        caption={`${formatNumber(leadsByType.contact)} contact · ${formatNumber(leadsByType.waitlist)} waitlist`}
        icon={<UserPlus className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Conversion"
        value={totals.conversionRate === null ? "—" : `${totals.conversionRate}%`}
        badge={<ChangeBadge value={change.conversionRate} unit="pts" />}
        caption={
          totals.conversionRate === null
            ? "needs at least one visitor"
            : previous.conversionRate === null
              ? "leads per visitor"
              : before(`${previous.conversionRate}%`)
        }
        icon={<Percent className="size-4" />}
        tone="warning"
      />
    </div>
  );
};
