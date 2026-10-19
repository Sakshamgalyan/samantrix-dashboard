"use client";

import { Button, Chip, Dropdown, Typography } from "@galyan/ui";
import {
  CalendarRange,
  Compass,
  FileText,
  Globe2,
  Megaphone,
  MonitorSmartphone,
} from "lucide-react";
import { AdminLoadError, AdminPageSkeleton, SectionEmpty } from "@/components/layout/common/states";
import { GlassSection } from "@/components/layout/common/glass-section";
import { formatDate, relativeTime } from "@/utils/format";
import { useMarketingContext } from "@/features/marketing-analytics/context";
import type { MarketingRange } from "@/features/marketing-analytics/types";
import { getCountryVisual, RANGE_OPTIONS } from "@/features/marketing-analytics/common/constants";
import { MarketingKpis } from "@/features/marketing-analytics/components/marketing-kpis";
import { TrafficTrend } from "@/features/marketing-analytics/components/traffic-trend";
import { ChannelsChart } from "@/features/marketing-analytics/components/channels-chart";
import { BreakdownDonut } from "@/features/marketing-analytics/components/breakdown-donut";
import { RankedList } from "@/features/marketing-analytics/components/ranked-list";
import { LeadFunnel } from "@/features/marketing-analytics/components/lead-funnel";
import { RecentVisitsTable } from "@/features/marketing-analytics/components/recent-visits-table";

const RANGE_DROPDOWN = RANGE_OPTIONS.map((o) => ({ value: o.id, label: `Last ${o.label}` }));

export const MarketingContent = () => {
  const { state, setRange, refresh } = useMarketingContext();
  const { report, error, refreshing, range } = state;

  if (!report) {
    return error ? (
      <AdminLoadError title="Marketing analytics unavailable" message={error} onRetry={refresh} />
    ) : (
      <AdminPageSkeleton kpis={5} />
    );
  }

  const { totals } = report;
  // `to` is exclusive (start of tomorrow, UTC), so the last day shown is the day before
  const lastDay = new Date(new Date(report.range.to).getTime() - 1).toISOString();

  return (
    <div className="space-y-3">
      {/* Responsive Toolbar: period + range picker + refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-[var(--gy-border)]/50 bg-[var(--gy-surface)]/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)] ring-1 ring-[var(--gy-primary)]/20">
            <CalendarRange className="size-4" />
          </div>
          <div className="min-w-0">
            <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="block truncate">
              {formatDate(report.range.from)} – {formatDate(lastDay)}
            </Typography>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs block">
              Updated {relativeTime(report.generatedAt)}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
          <div className="w-36 sm:w-44 shrink-0">
            <Dropdown
              size="sm"
              options={RANGE_DROPDOWN}
              value={String(range)}
              onChange={(v: string) => setRange(Number(v) as MarketingRange)}
            />
          </div>
        </div>
      </div>

      <MarketingKpis />

      <div className="grid gap-3 xl:grid-cols-3">
        <TrafficTrend className="xl:col-span-2" />
        <LeadFunnel />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ChannelsChart />
        <GlassSection
          title="Top pages"
          subtitle="Most visited paths"
          aside={
            report.topPages.length > 0 ? (
              <Chip size="sm" variant="neutral">
                {report.topPages.length} {report.topPages.length === 1 ? "page" : "pages"}
              </Chip>
            ) : null
          }
        >
          {report.topPages.length === 0 ? (
            <SectionEmpty icon={<FileText className="size-5" />} title="No page views yet" />
          ) : (
            <RankedList
              total={totals.visits}
              items={report.topPages.slice(0, 8).map((p) => ({
                key: p.path,
                label: (
                  <Typography
                    variant="small"
                    as="span"
                    textColor="var(--gy-text)"
                    className="font-mono text-xs select-all truncate block"
                  >
                    {p.path}
                  </Typography>
                ),
                count: p.visits,
                icon: <FileText className="size-3.5 text-[var(--gy-text-subtle)]" />,
              }))}
            />
          )}
        </GlassSection>
        <GlassSection
          title="UTM campaigns"
          subtitle="Visits tagged with utm_campaign"
          className="md:col-span-2 xl:col-span-1"
          aside={
            report.campaigns.length > 0 ? (
              <Chip size="sm" variant="neutral">
                {report.campaigns.length} {report.campaigns.length === 1 ? "campaign" : "campaigns"}
              </Chip>
            ) : null
          }
        >
          {report.campaigns.length === 0 ? (
            <SectionEmpty
              icon={<Megaphone className="size-5" />}
              title="No campaign traffic"
              description="Links tagged with utm_campaign show up here."
            />
          ) : (
            <RankedList
              total={totals.visits}
              items={report.campaigns
                .slice(0, 8)
                .map((c) => ({
                  key: c.campaign,
                  label: c.campaign,
                  count: c.visits,
                  icon: <Megaphone className="size-3.5 text-[var(--gy-text-subtle)]" />,
                }))}
            />
          )}
        </GlassSection>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <BreakdownDonut
          title="Devices"
          subtitle="Share of visits"
          items={report.devices}
          emptyIcon={<MonitorSmartphone className="size-5" />}
          emptyTitle="No device data yet"
          type="device"
        />
        <GlassSection
          title="Countries"
          subtitle="Where visits come from"
          aside={
            report.countries.length > 0 ? (
              <Chip size="sm" variant="neutral">
                {report.countries.length} {report.countries.length === 1 ? "country" : "countries"}
              </Chip>
            ) : null
          }
        >
          {report.countries.length === 0 ? (
            <SectionEmpty icon={<Globe2 className="size-5" />} title="No location data yet" />
          ) : (
            <RankedList
              total={totals.visits}
              items={report.countries
                .slice(0, 8)
                .map((c) => {
                  const { flag, name } = getCountryVisual(c.label);
                  return {
                    key: c.label,
                    label: name,
                    count: c.count,
                    icon: (
                      <span className="text-sm select-none" role="img" aria-label={name}>
                        {flag}
                      </span>
                    ),
                  };
                })}
            />
          )}
        </GlassSection>
        <BreakdownDonut
          title="Browsers"
          subtitle="Share of visits"
          items={report.browsers}
          emptyIcon={<Compass className="size-5" />}
          emptyTitle="No browser data yet"
          className="md:col-span-2 lg:col-span-1"
          type="browser"
        />
      </div>

      <RecentVisitsTable />
    </div>
  );
};
