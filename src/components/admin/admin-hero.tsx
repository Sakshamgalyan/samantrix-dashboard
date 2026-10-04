"use client";

import type React from "react";
import { Button, Card } from "@galyan/ui";
import { RefreshCw } from "lucide-react";

interface AdminHeroProps {
  title: string;
  description: React.ReactNode;
  /** Chips shown above the title (status, counts…). */
  chips?: React.ReactNode;
  /** Extra buttons placed before Refresh. */
  actions?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** ISO time of the data shown, rendered as "Updated 12:04". */
  updatedAt?: string | null;
}

/** Glass page intro used at the top of every admin console page. */
export function AdminHero({
  title,
  description,
  chips,
  actions,
  onRefresh,
  refreshing,
  updatedAt,
}: AdminHeroProps) {
  return (
    <Card variant="glass" radius="xl" padding="lg">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          {chips && (
            <div className="flex flex-wrap items-center gap-2">{chips}</div>
          )}
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--gy-text)]">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--gy-text-secondary)]">
            {description}
          </p>
        </div>
        {(actions || onRefresh) && (
          <div className="flex shrink-0 flex-col items-start gap-1.5 md:items-end">
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              {onRefresh && (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={onRefresh}
                  disabled={refreshing}
                  leftIcon={
                    <RefreshCw
                      className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
                    />
                  }
                >
                  Refresh
                </Button>
              )}
            </div>
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
