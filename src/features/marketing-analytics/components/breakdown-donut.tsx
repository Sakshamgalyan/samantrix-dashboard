"use client";

import type React from "react";
import { useMemo } from "react";
import { DonutChart } from "@galyan/ui";
import { GLASS_ROW, GlassSection, SectionEmpty } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import type { LabelCount } from "../types";
import { CHART_COLORS, sharePercent } from "../common/constants";

interface BreakdownDonutProps {
  title: string;
  subtitle: string;
  items: LabelCount[];
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  className?: string;
}

/** Donut + legend rows for a share-of-visits breakdown (devices, browsers). */
export function BreakdownDonut({
  title,
  subtitle,
  items,
  emptyIcon,
  emptyTitle,
  className,
}: BreakdownDonutProps) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const data = useMemo(
    () =>
      items.map((i, index) => ({
        name: i.label,
        value: i.count,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [items],
  );

  return (
    <GlassSection className={className} title={title} subtitle={subtitle}>
      {total === 0 ? (
        <SectionEmpty
          icon={emptyIcon}
          title={emptyTitle}
          description="Shown once visits are tracked."
        />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="h-[200px] w-full">
            <DonutChart
              data={data}
              height={200}
              variant="standard"
              showCenterMetric
              centerMetric={{ label: "Visits", value: formatNumber(total) }}
            />
          </div>
          <ul className="grid w-full gap-2">
            {data.map((d) => (
              <li
                key={d.name}
                className={`${GLASS_ROW} flex items-center gap-2.5 px-3 py-2`}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--gy-text)]">
                  {d.name}
                </span>
                <span className="text-sm font-semibold text-[var(--gy-text)]">
                  {formatNumber(d.value)}
                </span>
                <span className="w-10 text-right text-xs text-[var(--gy-text-secondary)]">
                  {sharePercent(d.value, total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassSection>
  );
}
