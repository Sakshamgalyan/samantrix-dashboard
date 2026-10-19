"use client";

import { AreaChart, DonutChart } from "@galyan/ui";
import { LineChart, PieChart } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { compactMoney, money, monthLabel, PLAN_COLORS, PLAN_LABELS } from "@/features/payments/common/constants";
import type { RevenueReport } from "@/features/revenue/types/api";

/** Collected revenue and refunds per month (12 months). */
export function RevenueTrendChart({
  report,
  height = 260,
  className,
  compact = false,
}: {
  report: RevenueReport;
  height?: number;
  className?: string;
  compact?: boolean;
}) {
  const data = report.trend.map((t) => ({
    label: monthLabel(t.month, t.month.endsWith("-01")),
    Collected: t.collected,
    Refunds: t.refunds,
  }));
  const hasData = report.trend.some((t) => t.collected !== 0 || t.refunds !== 0);
  const total = report.kpis.collectedLast12m;

  return (
    <GlassSection
      className={className}
      title="Collections"
      subtitle={`Last 12 months · ${money(total, report.currency)} net`}
    >
      {hasData ? (
        <AreaChart
          data={data}
          xAxisKey="label"
          height={height}
          showLegend={!compact}
          series={[
            { key: "Collected", name: "Collected", color: "var(--gy-success)" },
            ...(compact ? [] : [{ key: "Refunds", name: "Refunds", color: "var(--gy-warning)" }]),
          ]}
        />
      ) : (
        <SectionEmpty
          icon={<LineChart className="size-5" />}
          title="No collections yet"
          description="Razorpay payments and recorded payments appear here month by month."
        />
      )}
    </GlassSection>
  );
}

/** MRR split by plan, with organizations and seats per plan. */
export function PlanMixChart({ report, className }: { report: RevenueReport; className?: string }) {
  const rows = report.planMix.filter((p) => p.mrr > 0 || p.organizations > 0);
  const data = rows.map((p) => ({ name: PLAN_LABELS[p.planTier], value: p.mrr, color: PLAN_COLORS[p.planTier] }));
  const totalMrr = report.kpis.mrr || rows.reduce((s, r) => s + r.mrr, 0);

  return (
    <GlassSection className={className} title="Plan mix" subtitle="Monthly recurring revenue by plan">
      {data.length === 0 || data.every((d) => d.value === 0) ? (
        <SectionEmpty icon={<PieChart className="size-5" />} title="No paying plans yet" />
      ) : (
        <div className="space-y-3">
          <DonutChart
            data={data}
            height={200}
            borderless
            showLegend={false}
            showCenterMetric
            centerMetric={{ label: "MRR", value: compactMoney(report.kpis.mrr, report.currency) }}
            tooltipConfig={{ show: true, formatter: (v) => money(v, report.currency) }}
          />
          <div className="space-y-1.5">
            {rows.map((p) => {
              const pct = totalMrr > 0 ? Math.round((p.mrr / totalMrr) * 100) : 0;
              return (
                <div key={p.planTier} className={`${GLASS_ROW} flex items-center gap-2 px-2.5 py-1.5 text-xs`}>
                  <span className="size-2 shrink-0 rounded-full" style={{ background: PLAN_COLORS[p.planTier] }} />
                  <span className="flex-1 truncate font-medium text-[var(--gy-text)]">
                    {PLAN_LABELS[p.planTier]}
                    <span className="ml-1.5 text-[11px] font-normal text-[var(--gy-text-subtle)]">({pct}%)</span>
                  </span>
                  <span className="text-[var(--gy-text-subtle)]">
                    {p.organizations} org{p.organizations === 1 ? "" : "s"} · {p.seats} seats
                  </span>
                  <span className="min-w-[5.5rem] shrink-0 text-right font-semibold text-[var(--gy-text)]">
                    {money(p.mrr, report.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassSection>
  );
}
