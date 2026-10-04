"use client";

import type React from "react";
import { AnimatedNumber, Card } from "@galyan/ui";

export type KpiTone = "primary" | "success" | "warning" | "danger" | "info";

const TONES: Record<KpiTone, string> = {
  primary:
    "bg-[var(--gy-primary)]/12 text-[var(--gy-primary)] ring-[var(--gy-primary)]/20",
  success:
    "bg-[var(--gy-success)]/12 text-[var(--gy-success)] ring-[var(--gy-success)]/20",
  warning:
    "bg-[var(--gy-warning)]/12 text-[var(--gy-warning)] ring-[var(--gy-warning)]/20",
  danger:
    "bg-[var(--gy-danger)]/12 text-[var(--gy-danger)] ring-[var(--gy-danger)]/20",
  info: "bg-[var(--gy-info)]/12 text-[var(--gy-info)] ring-[var(--gy-info)]/20",
};

interface KpiCardProps {
  label: string;
  icon: React.ReactNode;
  /** A number animates; pass a string/node for pre-formatted values (e.g. money). */
  value: number | React.ReactNode;
  caption?: React.ReactNode;
  /** Small element next to the value (growth, live dot…). */
  badge?: React.ReactNode;
  tone?: KpiTone;
}

/** Glass KPI tile for the admin console KPI rows (use 4 per row: sm:grid-cols-2 xl:grid-cols-4). */
export function KpiCard({
  label,
  icon,
  value,
  caption,
  badge,
  tone = "primary",
}: KpiCardProps) {
  return (
    <Card variant="glass" radius="xl" padding="md" hoverEffect="lift">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--gy-text-secondary)]">
          {label}
        </span>
        <div
          className={`grid size-9 shrink-0 place-items-center rounded-xl ring-1 ${TONES[tone]}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="text-3xl font-bold tracking-tight text-[var(--gy-text)]">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </div>
        {badge}
      </div>
      {caption && (
        <p className="mt-1.5 text-xs text-[var(--gy-text-subtle)]">{caption}</p>
      )}
    </Card>
  );
}
