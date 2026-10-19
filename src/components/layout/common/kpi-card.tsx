"use client";

import type React from "react";
import { AnimatedNumber, Card, Typography } from "@galyan/ui";

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

export interface KpiCardProps {
  label: string;
  icon: React.ReactNode;
  /** A number animates; pass a string/node for pre-formatted values (e.g. money). */
  value: number | React.ReactNode;
  caption?: React.ReactNode;
  /** Small element next to the value (growth, live dot…). */
  badge?: React.ReactNode;
  tone?: KpiTone;
}

/** Compact KPI tile for console KPI rows (grid gap-3, sm:grid-cols-2 xl:grid-cols-4). */
export const KpiCard = ({
  label,
  icon,
  value,
  caption,
  badge,
  tone = "primary",
}: KpiCardProps) => {
  return (
    <Card variant="glass" radius="lg" padding="sm">
      <div className="flex items-center justify-between gap-3">
        <Typography
          variant="small"
          weight="medium"
          textColor="var(--gy-text-secondary)"
          className="truncate"
        >
          {label}
        </Typography>
        <div
          className={`grid size-7 shrink-0 place-items-center rounded-lg ring-1 [&_svg]:size-3.5 ${TONES[tone]}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <Typography
          variant="h4"
          weight="semibold"
          textColor="var(--gy-text)"
          className="tracking-tight"
        >
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </Typography>
        {badge}
      </div>
      {caption && (
        <Typography
          variant="small"
          textColor="var(--gy-text-subtle)"
          className="mt-0.5 truncate block"
        >
          {caption}
        </Typography>
      )}
    </Card>
  );
};
