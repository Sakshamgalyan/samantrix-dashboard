"use client";

import { Eye, Percent, UserPlus, Users } from "lucide-react";
import { KpiCard } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { useMarketingContext } from "../context";
import { ChangeBadge } from "./change-badge";

/** Visits, unique visitors, leads and conversion for the selected window, each vs the previous one. */
export function MarketingKpis() {
  const { state } = useMarketingContext();
  const report = state.report;
  if (!report) return null;
  const { totals, previous, change, leadsByType, range } = report;
  const vsPrev = (prev: string) => `${prev} in the previous ${range.days} days`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Visits"
        value={totals.visits}
        badge={<ChangeBadge value={change.visits} />}
        caption={vsPrev(formatNumber(previous.visits))}
        icon={<Eye className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Unique visitors"
        value={totals.uniqueVisitors}
        badge={<ChangeBadge value={change.uniqueVisitors} />}
        caption={`${formatNumber(totals.sessions)} sessions · ${formatNumber(previous.uniqueVisitors)} visitors before`}
        icon={<Users className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Leads captured"
        value={totals.leads}
        badge={<ChangeBadge value={change.leads} />}
        caption={`${formatNumber(leadsByType.waitlist)} waitlist · ${formatNumber(leadsByType.contact)} contact requests`}
        icon={<UserPlus className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Conversion rate"
        value={
          totals.conversionRate === null ? "—" : `${totals.conversionRate}%`
        }
        badge={<ChangeBadge value={change.conversionRate} unit="pts" />}
        caption={
          totals.conversionRate === null
            ? "needs at least one visitor"
            : previous.conversionRate === null
              ? "leads per unique visitor"
              : vsPrev(`${previous.conversionRate}%`)
        }
        icon={<Percent className="size-4" />}
        tone="warning"
      />
    </div>
  );
}
