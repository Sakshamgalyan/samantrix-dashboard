"use client";

import React from "react";
import { Chip, Tooltip, Typography } from "@galyan/ui";
import { Info } from "lucide-react";

export interface HeaderTitleProps {
  title: string;
  eyebrow?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: "primary" | "danger" | "success" | "warning" | "neutral";
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({
  title,
  eyebrow,
  description,
  icon,
  badge,
  badgeColor,
}) => {
  const chipVariant =
    badgeColor === "warning" ||
    badgeColor === "danger" ||
    badgeColor === "success" ||
    badgeColor === "neutral"
      ? badgeColor
      : "soft";

  return (
    <div className="flex min-w-0 items-center gap-3">
      {icon && (
        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--gy-border)] bg-gradient-to-b from-[var(--gy-surface)] to-[var(--gy-bg-secondary)] shadow-xs transition-all duration-200 hover:border-[var(--gy-primary)]/40 hover:shadow-sm">
          <div className="absolute inset-0 rounded-xl bg-[var(--gy-primary)]/5 opacity-50 pointer-events-none" />
          <span className="relative z-10 flex items-center justify-center text-[var(--gy-primary)]">
            {icon}
          </span>
        </div>
      )}

      <div className="flex min-w-0 flex-col justify-center">
        {eyebrow && (
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="relative flex size-1.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gy-primary)] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--gy-primary)]" />
            </span>
            <span className="select-none text-[10px] font-semibold uppercase tracking-wider text-[var(--gy-text-muted)]">
              {eyebrow}
            </span>
          </div>
        )}

        <div className="flex min-w-0 items-center gap-2">
          <Typography
            variant="h5"
            weight="semibold"
            className="truncate font-heading text-base tracking-tight text-[var(--gy-text)] sm:text-lg"
          >
            {title}
          </Typography>

          {badge && (
            <Chip
              size="sm"
              variant={chipVariant}
              className="h-5 px-1.5 text-[10px] font-medium leading-none"
            >
              {badge}
            </Chip>
          )}

          {description && (
            <Tooltip
              content={
                <div className="w-64 space-y-2 p-1 text-left">
                  <div className="flex items-center gap-1.5 border-b border-[var(--gy-border)] pb-1.5 text-xs font-semibold text-[var(--gy-text)]">
                    <Info className="size-3.5 shrink-0 text-[var(--gy-primary)]" />
                    <span>About {title}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--gy-text-secondary)]">
                    {description}
                  </p>
                </div>
              }
              position="bottom"
              size="md"
              linebreak
              maxWidth={320}
            >
              <button
                type="button"
                aria-label={`About ${title}`}
                className="group inline-flex size-6 items-center justify-center rounded-full border border-transparent text-[var(--gy-text-subtle)] transition-all duration-200 hover:border-[var(--gy-border)] hover:bg-[var(--gy-surface-hover)] hover:text-[var(--gy-primary)] hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gy-primary)]/40"
              >
                <Info className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderTitle;
