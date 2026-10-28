import React from "react";
import { Skeleton } from "@galyan/ui";

/**
 * Universal Dashboard Page Loading Skeleton.
 * Provides realistic KPI cards, action headers, and table row placeholders
 * matching @galyan/theme tokens for zero layout shifts and instant perceived performance.
 */
export const PageFallback: React.FC = () => {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Action Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--gy-border)] pb-4">
        <div className="space-y-2">
          <Skeleton height="28px" width="220px" className="rounded-md" />
          <Skeleton height="14px" width="340px" className="rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton height="36px" width="110px" className="rounded-lg" />
          <Skeleton height="36px" width="130px" className="rounded-lg" />
        </div>
      </div>

      {/* KPI 4-Card Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--gy-border)] bg-[var(--gy-surface-primary)] p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton height="14px" width="80px" className="rounded" />
              <Skeleton height="32px" width="32px" className="rounded-lg" />
            </div>
            <Skeleton height="28px" width="120px" className="rounded-md" />
            <Skeleton height="12px" width="90px" className="rounded" />
          </div>
        ))}
      </div>

      {/* Table / Main Data Viewport Skeleton */}
      <div className="rounded-2xl border border-[var(--gy-border)] bg-[var(--gy-surface-primary)] p-5 space-y-4 shadow-xs">
        {/* Table Filter / Search Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--gy-border)] pb-4">
          <Skeleton height="36px" width="280px" className="rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton height="36px" width="90px" className="rounded-lg" />
            <Skeleton height="36px" width="90px" className="rounded-lg" />
          </div>
        </div>

        {/* Table Rows Placeholder */}
        <div className="space-y-3 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 p-3 rounded-xl border border-[var(--gy-border-subtle)] bg-[var(--gy-surface-secondary)]"
            >
              <div className="flex items-center gap-3">
                <Skeleton height="36px" width="36px" className="rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton height="14px" width="160px" className="rounded" />
                  <Skeleton height="12px" width="110px" className="rounded" />
                </div>
              </div>
              <Skeleton height="22px" width="80px" className="rounded-full" />
              <Skeleton height="14px" width="90px" className="rounded" />
              <Skeleton height="28px" width="28px" className="rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageFallback;
