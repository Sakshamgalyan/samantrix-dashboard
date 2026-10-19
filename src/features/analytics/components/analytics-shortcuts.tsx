"use client";

import React from "react";
import Link from "next/link";
import { Card, Typography } from "@galyan/ui";
import { ArrowUpRight } from "lucide-react";
import { ANALYTICS_SHORTCUTS } from "@/features/analytics/common/constants";

export function AnalyticsShortcuts() {
  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs space-y-3.5"
    >
      <div className="flex items-center justify-between">
        <Typography
          variant="h4"
          weight="semibold"
          textColor="var(--gy-text)"
          className="text-sm font-semibold tracking-tight"
        >
          Quick Management Portals
        </Typography>
        <Typography
          variant="small"
          textColor="var(--gy-text-subtle)"
          className="text-xs"
        >
          Direct administrative controls
        </Typography>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {ANALYTICS_SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.title}
            href={shortcut.href}
            className="group flex flex-col justify-between rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-subtle)] p-3 transition-all duration-200 hover:border-[var(--gy-primary)] hover:bg-[var(--gy-surface)] hover:shadow-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <Typography
                  variant="span"
                  weight="semibold"
                  textColor="var(--gy-text)"
                  className="text-xs group-hover:text-[var(--gy-primary)] transition-colors"
                >
                  {shortcut.title}
                </Typography>
                <ArrowUpRight className="size-3.5 text-[var(--gy-text-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--gy-primary)] shrink-0" />
              </div>
              <Typography
                variant="small"
                textColor="var(--gy-text-secondary)"
                className="text-[11px] leading-relaxed block"
              >
                {shortcut.description}
              </Typography>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
