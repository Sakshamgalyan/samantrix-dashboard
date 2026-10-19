"use client";

import type React from "react";
import { useMemo } from "react";
import { Chip, DonutChart, Typography } from "@galyan/ui";
import { Compass, Globe, Laptop, Monitor, Smartphone, Tablet } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { formatNumber } from "@/utils/format";
import type { LabelCount } from "@/features/marketing-analytics/types";
import { CHART_COLORS, sharePercent } from "@/features/marketing-analytics/common/constants";

interface BreakdownDonutProps {
  title: string;
  subtitle: string;
  items: LabelCount[];
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  className?: string;
  type?: "device" | "browser" | "generic";
}

const getItemIcon = (name: string, type?: "device" | "browser" | "generic") => {
  const norm = name.toLowerCase();
  if (type === "device") {
    if (norm.includes("mobile") || norm.includes("phone")) {
      return <Smartphone className="size-3.5 text-[var(--gy-text-secondary)]" />;
    }
    if (norm.includes("tablet") || norm.includes("ipad")) {
      return <Tablet className="size-3.5 text-[var(--gy-text-secondary)]" />;
    }
    if (norm.includes("desktop") || norm.includes("laptop")) {
      return <Laptop className="size-3.5 text-[var(--gy-text-secondary)]" />;
    }
    return <Monitor className="size-3.5 text-[var(--gy-text-secondary)]" />;
  }

  if (type === "browser") {
    if (norm.includes("safari")) {
      return <Compass className="size-3.5 text-[var(--gy-text-secondary)]" />;
    }
    return <Globe className="size-3.5 text-[var(--gy-text-secondary)]" />;
  }

  return null;
};

/** Donut breakdown with a clean side legend, no nested card borders or duplicated legends. */
export const BreakdownDonut = ({
  title,
  subtitle,
  items,
  emptyIcon,
  emptyTitle,
  className,
  type = "generic",
}: BreakdownDonutProps) => {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const data = useMemo(
    () =>
      items.slice(0, 6).map((i, index) => ({
        name: i.label,
        value: i.count,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [items],
  );

  return (
    <GlassSection
      className={className}
      title={title}
      subtitle={subtitle}
      aside={
        total > 0 ? (
          <Chip size="sm" variant="neutral">
            {formatNumber(total)} {total === 1 ? "visit" : "visits"}
          </Chip>
        ) : null
      }
    >
      {total === 0 ? (
        <SectionEmpty icon={emptyIcon} title={emptyTitle} />
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
          <div className="h-[140px] w-[140px] shrink-0 flex items-center justify-center">
            <DonutChart
              data={data}
              height={140}
              width={140}
              variant="standard"
              borderless
              showLegend={false}
              showCenterMetric
              centerMetric={{ label: "Visits", value: formatNumber(total) }}
              className="!p-0 !m-0 !bg-transparent !border-0 !shadow-none"
            />
          </div>
          <ul className="min-w-0 w-full flex-1 space-y-1">
            {data.map((d) => {
              const icon = getItemIcon(d.name, type);
              return (
                <li
                  key={d.name}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--gy-surface-hover)]/40"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: d.color }}
                    />
                    {icon && <span className="shrink-0 flex items-center">{icon}</span>}
                    <Typography
                      variant="small"
                      textColor="var(--gy-text)"
                      className="truncate text-xs font-medium"
                    >
                      {d.name}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Typography
                      variant="small"
                      weight="semibold"
                      textColor="var(--gy-text)"
                      className="tabular-nums text-xs"
                    >
                      {formatNumber(d.value)}
                    </Typography>
                    <Typography
                      variant="small"
                      textColor="var(--gy-text-secondary)"
                      className="tabular-nums text-xs min-w-[36px] text-right font-medium"
                    >
                      {sharePercent(d.value, total)}
                    </Typography>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </GlassSection>
  );
};
