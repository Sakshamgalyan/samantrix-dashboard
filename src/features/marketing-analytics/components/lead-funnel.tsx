"use client";

import { useMemo } from "react";
import { BarChart, Typography } from "@galyan/ui";
import { Filter } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { formatDay, formatNumber } from "@/utils/format";
import { useMarketingContext } from "@/features/marketing-analytics/context";

/** Visitors → sessions → leads, then leads per day for the window. */
export const LeadFunnel = ({ className }: { className?: string }) => {
  const { state } = useMarketingContext();
  const report = state.report;

  const leadsPerDay = useMemo(
    () =>
      (report?.trend ?? []).slice(-14).map((d) => ({
        label: formatDay(d.date),
        value: d.leads,
        color: "var(--gy-success)",
      })),
    [report],
  );

  if (!report) return null;
  const { totals } = report;
  const steps = [
    { label: "Visitors", value: totals.uniqueVisitors, color: "var(--gy-primary)" },
    { label: "Sessions", value: totals.sessions, color: "var(--gy-info)" },
    { label: "Leads", value: totals.leads, color: "var(--gy-success)" },
  ];
  const top = Math.max(steps[0].value, steps[1].value, 1);

  return (
    <GlassSection className={className} title="Lead funnel" subtitle="From visit to enquiry">
      {totals.uniqueVisitors === 0 && totals.leads === 0 ? (
        <SectionEmpty icon={<Filter className="size-5" />} title="No traffic in this period" />
      ) : (
        <div className="space-y-3">
          <div className="space-y-2.5">
            {steps.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between">
                  <Typography variant="small" textColor="var(--gy-text-secondary)">
                    {s.label}
                  </Typography>
                  <Typography variant="small" weight="semibold" textColor="var(--gy-text)" className="tabular-nums">
                    {formatNumber(s.value)}
                  </Typography>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--gy-border)]/50">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max((s.value / top) * 100, s.value > 0 ? 2 : 0)}%`, background: s.color }}
                  />
                </div>
              </div>
            ))}
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="block text-xs">
              {totals.conversionRate === null
                ? "Conversion appears once visitors arrive."
                : `${totals.conversionRate}% of visitors became leads`}
            </Typography>
          </div>
          {leadsPerDay.some((d) => d.value > 0) && (
            <div className="pt-1">
              <Typography variant="small" weight="medium" textColor="var(--gy-text-secondary)" className="mb-1.5 block">
                Leads per day
              </Typography>
              <div className="h-[110px] w-full min-w-0">
                <BarChart variant="filled" data={leadsPerDay} height={110} />
              </div>
            </div>
          )}
        </div>
      )}
    </GlassSection>
  );
};
