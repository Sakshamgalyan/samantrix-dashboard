"use client";

import type React from "react";
import { ProgressBar } from "@galyan/ui";
import { GLASS_ROW } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { sharePercent } from "../common/constants";

export interface RankedItem {
  key: string;
  label: React.ReactNode;
  count: number;
}

/** Ranked rows with a share-of-total bar (top pages, countries, campaigns). */
export function RankedList({
  items,
  total,
}: {
  items: RankedItem[];
  total: number;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={item.key} className={`${GLASS_ROW} px-3 py-2.5`}>
          <div className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-xs font-semibold text-[var(--gy-text-subtle)]">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--gy-text)]">
              {item.label}
            </div>
            <span className="shrink-0 text-sm font-semibold text-[var(--gy-text)]">
              {formatNumber(item.count)}
            </span>
            <span className="w-10 shrink-0 text-right text-xs text-[var(--gy-text-secondary)]">
              {sharePercent(item.count, total)}
            </span>
          </div>
          <div className="mt-2 pl-8">
            <ProgressBar
              progress={(item.count / max) * 100}
              size="sm"
              variant="primary"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
