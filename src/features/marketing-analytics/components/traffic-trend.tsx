"use client";

import { useMemo } from "react";
import { AreaChart, Chip } from "@galyan/ui";
import { LineChart as LineChartIcon } from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import { formatDay, formatNumber } from "@/lib/format";
import { useMarketingContext } from "../context";

/** Daily visits and unique visitors over the selected window. */
export function TrafficTrend({ className }: { className?: string }) {
  const { state } = useMarketingContext();
  const report = state.report;

  const data = useMemo(
    () =>
      (report?.trend ?? []).map((d) => ({
        label: formatDay(d.date),
        visits: d.visits,
        uniqueVisitors: d.uniqueVisitors,
      })),
    [report],
  );

  if (!report) return null;
  const peak = report.trend.reduce(
    (best, d) => (d.visits > best.visits ? d : best),
    report.trend[0] ?? { date: "", visits: 0 },
  );

  return (
    <GlassSection
      className={className}
      title="Traffic trend"
      subtitle={`Daily visits and unique visitors · last ${report.range.days} days (UTC)`}
      aside={
        peak.visits > 0 ? (
          <Chip size="sm" variant="soft" className="whitespace-nowrap">
            Peak {formatNumber(peak.visits)} on {formatDay(peak.date)}
          </Chip>
        ) : undefined
      }
    >
      {report.totals.visits === 0 ? (
        <SectionEmpty
          icon={<LineChartIcon className="size-5" />}
          title="No visits in this period"
          description="Page views tracked on the marketing site will chart here day by day."
        />
      ) : (
        <div className="h-[290px] w-full">
          <AreaChart
            data={data}
            xAxisKey="label"
            height={290}
            series={[
              { key: "visits", name: "Visits", color: "var(--gy-primary)" },
              {
                key: "uniqueVisitors",
                name: "Unique visitors",
                color: "var(--gy-info)",
              },
            ]}
          />
        </div>
      )}
      {report.truncated && (
        <p className="mt-3 text-xs text-[var(--gy-text-subtle)]">
          Very busy period: the daily series uses the most recent 100,000
          visits. Totals are exact.
        </p>
      )}
    </GlassSection>
  );
}
