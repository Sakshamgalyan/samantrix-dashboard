"use client";

import type React from "react";
import { Typography } from "@galyan/ui";
import { formatNumber } from "@/utils/format";
import { sharePercent } from "@/features/marketing-analytics/common/constants";

export interface RankedItem {
  key: string;
  label: React.ReactNode;
  count: number;
  icon?: React.ReactNode;
}

/** Compact ranked rows with an elegant progress track underneath (top pages, countries, campaigns). */
export const RankedList = ({ items, total }: { items: RankedItem[]; total: number }) => {
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const pct = Math.max(3, Math.round((item.count / max) * 100));
        return (
          <li
            key={item.key}
            className="group rounded-lg p-1.5 transition-all hover:bg-[var(--gy-surface-hover)]/40 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                {item.icon && <span className="shrink-0 flex items-center">{item.icon}</span>}
                <div className="min-w-0 flex-1 truncate">
                  {typeof item.label === "string" ? (
                    <Typography
                      variant="small"
                      weight="medium"
                      textColor="var(--gy-text)"
                      className="truncate block text-xs"
                    >
                      {item.label}
                    </Typography>
                  ) : (
                    item.label
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Typography
                  variant="small"
                  weight="semibold"
                  textColor="var(--gy-text)"
                  className="tabular-nums text-xs"
                >
                  {formatNumber(item.count)}
                </Typography>
                <Typography
                  variant="small"
                  textColor="var(--gy-text-secondary)"
                  className="tabular-nums text-xs min-w-[36px] text-right font-medium"
                >
                  {sharePercent(item.count, total)}
                </Typography>
              </div>
            </div>
            {/* Clean, slim progress track — never obscures or splits text */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--gy-border)]/50">
              <div
                className="h-full rounded-full bg-[var(--gy-primary)]/80 transition-all duration-500 ease-out group-hover:bg-[var(--gy-primary)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};
