"use client";

import type React from "react";
import { Card } from "@galyan/ui";

export interface HeroProps {
  title: string;
  description: React.ReactNode;
  /** Chips shown above the title (status, counts…). */
  chips?: React.ReactNode;
  /** Action buttons. */
  actions?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** ISO time of the data shown, rendered as "Updated 12:04". */
  updatedAt?: string | null;
}

/** Glass page intro used at the top of console pages. */
export function PageHero({
  title,
  description,
  chips,
  actions,
  updatedAt,
}: HeroProps) {
  return (
    <Card variant="glass" radius="lg" padding="md">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="space-y-1">
          {chips && (
            <div className="flex flex-wrap items-center gap-2">{chips}</div>
          )}
          <h2 className="text-lg font-semibold tracking-tight text-[var(--gy-text)]">
            {title}
          </h2>
          <p className="max-w-2xl text-xs leading-relaxed text-[var(--gy-text-secondary)]">
            {description}
          </p>
        </div>
        {(actions || updatedAt) && (
          <div className="flex shrink-0 flex-col items-start gap-1.5 md:items-end">
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            {updatedAt && (
              <span className="text-[11px] text-[var(--gy-text-subtle)]">
                Updated{" "}
                {new Date(updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/** Backward compatible alias for AdminHero */
export const AdminHero = PageHero;
