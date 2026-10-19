"use client";

import { Button, Chip, Skeleton, Typography } from "@galyan/ui";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Monitor,
  MousePointerClick,
  Smartphone,
  Tablet,
} from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { formatDateTime, formatNumber, relativeTime } from "@/utils/format";
import { useMarketingContext } from "@/features/marketing-analytics/context";
import type { VisitorLogRow } from "@/features/marketing-analytics/types";

const DeviceIcon = ({ type }: { type: string }) => {
  const t = type.toLowerCase();
  const Icon = t === "mobile" ? Smartphone : t === "tablet" ? Tablet : Monitor;
  return <Icon className="size-3.5 shrink-0 text-[var(--gy-text-subtle)]" />;
};

/** Where a visit came from: campaign/UTM first, then the referrer host, else Direct. */
const sourceLabel = (row: VisitorLogRow): string => {
  if (row.utmSource) return row.utmSource;
  if (!row.referrer) return "Direct";
  try {
    return new URL(row.referrer).hostname.replace(/^www\./, "");
  } catch {
    return row.referrer;
  }
};

/** Latest tracked page views as a responsive list, newest first, paged on the server. */
export const RecentVisitsTable = () => {
  const { state, setVisitsPage } = useMarketingContext();
  const { visits, visitsLoading } = state;
  const meta = visits?.meta;

  return (
    <GlassSection
      title="Recent visits"
      subtitle={meta && meta.total > 0 ? `${formatNumber(meta.total)} page views tracked` : "Latest page views"}
      aside={
        meta &&
        meta.totalPages > 1 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Typography variant="small" textColor="var(--gy-text-secondary)" className="tabular-nums text-xs">
              {meta.page} / {meta.totalPages}
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Newer visits"
              disabled={!meta.hasPreviousPage || visitsLoading}
              onClick={() => setVisitsPage(meta.page - 1)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Older visits"
              disabled={!meta.hasNextPage || visitsLoading}
              onClick={() => setVisitsPage(meta.page + 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        )
      }
    >
      {!visits ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="40px" />
          ))}
        </div>
      ) : meta && meta.total === 0 ? (
        <SectionEmpty
          icon={<MousePointerClick className="size-5" />}
          title="No visits tracked yet"
          description="Each page view on the Simantrix website is listed here."
        />
      ) : (
        <ul className={`divide-y divide-[var(--gy-border)]/50 ${visitsLoading ? "opacity-60" : ""}`}>
          {visits.data.map((row) => {
            const location = [row.city, row.country].filter(Boolean).join(", ");
            const clientInfo = [row.browser, row.os].filter(Boolean).join(" · ") || row.deviceType;
            const src = sourceLabel(row);

            return (
              <li
                key={row.id}
                className="group flex flex-col gap-1.5 py-2.5 px-2 -mx-2 rounded-lg transition-colors hover:bg-[var(--gy-surface-hover)]/30 sm:flex-row sm:items-center sm:gap-3"
              >
                {/* Desktop & Mobile Path & Device */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <DeviceIcon type={row.deviceType} />
                  <Typography
                    variant="small"
                    textColor="var(--gy-text)"
                    className="font-mono text-xs truncate select-all group-hover:text-[var(--gy-primary)] transition-colors"
                  >
                    {row.path}
                  </Typography>
                </div>

                {/* Metadata Row for Mobile / Columns for Desktop */}
                <div className="flex items-center justify-between gap-2 text-xs sm:justify-end sm:gap-3 shrink-0">
                  {/* Location tag */}
                  {location && (
                    <div className="flex items-center gap-1 max-w-[160px] truncate text-xs text-[var(--gy-text-secondary)]">
                      <Globe className="size-3 shrink-0 text-[var(--gy-text-subtle)]" />
                      <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs">
                        {location}
                      </Typography>
                    </div>
                  )}

                  {/* Browser/OS (Desktop only) */}
                  <Typography
                    variant="small"
                    textColor="var(--gy-text-subtle)"
                    className="hidden lg:block max-w-[140px] truncate text-xs"
                  >
                    {clientInfo}
                  </Typography>

                  {/* Source Chip */}
                  <Chip size="sm" variant={row.utmSource ? "solid" : "soft"} className="whitespace-nowrap shrink-0">
                    <Typography variant="small" as="span" className="block max-w-[110px] truncate text-xs">
                      {src}
                    </Typography>
                  </Chip>

                  {/* Timestamp */}
                  <Typography
                    variant="small"
                    textColor="var(--gy-text-subtle)"
                    className="w-16 text-right whitespace-nowrap text-xs tabular-nums shrink-0"
                    title={formatDateTime(row.createdAt)}
                  >
                    {relativeTime(row.createdAt)}
                  </Typography>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GlassSection>
  );
};
