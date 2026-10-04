"use client";

import { Chip, Tabs } from "@galyan/ui";
import {
  FileText,
  Globe2,
  Megaphone,
  MonitorSmartphone,
  Compass,
} from "lucide-react";
import {
  AdminHero,
  AdminLoadError,
  AdminPageSkeleton,
  GlassSection,
  SectionEmpty,
  StaleDataBanner,
} from "@/components/admin";
import { formatDate } from "@/lib/format";
import { useMarketingContext } from "../context";
import type { MarketingRange } from "../types";
import { RANGE_OPTIONS } from "../common/constants";
import { MarketingKpis } from "./marketing-kpis";
import { TrafficTrend } from "./traffic-trend";
import { ChannelsChart } from "./channels-chart";
import { BreakdownDonut } from "./breakdown-donut";
import { RankedList } from "./ranked-list";
import { RecentVisitsTable } from "./recent-visits-table";

export function MarketingContent() {
  const { state, setRange, refresh } = useMarketingContext();
  const { report, error, refreshing, range } = state;

  if (!report) {
    return error ? (
      <AdminLoadError
        title="Marketing analytics unavailable"
        message={error}
        onRetry={refresh}
      />
    ) : (
      <AdminPageSkeleton />
    );
  }

  const { totals } = report;
  // `to` is exclusive (start of tomorrow, UTC), so the last day shown is the day before
  const lastDay = new Date(
    new Date(report.range.to).getTime() - 1,
  ).toISOString();

  return (
    <div className="space-y-6">
      {error && <StaleDataBanner error={error} />}

      <AdminHero
        title="Marketing analytics"
        description="Traffic and lead conversion from the Samantrix marketing site: where visitors come from, what they read, and how many sign up for the waitlist or get in touch."
        chips={
          <>
            <Chip variant="soft" size="sm">
              Growth & telemetry
            </Chip>
            <Chip variant="neutral" size="sm" className="whitespace-nowrap">
              {formatDate(report.range.from)} – {formatDate(lastDay)}
            </Chip>
          </>
        }
        actions={
          <Tabs
            items={RANGE_OPTIONS}
            activeTab={String(range)}
            onTabChange={(id) => setRange(Number(id) as MarketingRange)}
            variant="button"
            size="sm"
          />
        }
        onRefresh={refresh}
        refreshing={refreshing}
        updatedAt={report.generatedAt}
      />

      <MarketingKpis />

      <div className="grid gap-6 xl:grid-cols-3">
        <TrafficTrend className="xl:col-span-2" />
        <ChannelsChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <BreakdownDonut
          title="Devices"
          subtitle="Share of visits by device type"
          items={report.devices}
          emptyIcon={<MonitorSmartphone className="size-5" />}
          emptyTitle="No device data yet"
        />
        <BreakdownDonut
          title="Browsers"
          subtitle="Share of visits by browser"
          items={report.browsers}
          emptyIcon={<Compass className="size-5" />}
          emptyTitle="No browser data yet"
        />
        <GlassSection
          title="Countries"
          subtitle="Where visits come from"
          className="lg:col-span-2 xl:col-span-1"
        >
          {report.countries.length === 0 ? (
            <SectionEmpty
              icon={<Globe2 className="size-5" />}
              title="No location data yet"
              description="Visitor countries appear once visits are tracked."
            />
          ) : (
            <RankedList
              total={totals.visits}
              items={report.countries.map((c) => ({
                key: c.label,
                label: c.label,
                count: c.count,
              }))}
            />
          )}
        </GlassSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassSection
          className="xl:col-span-2"
          title="Top pages"
          subtitle="Most visited paths in this period"
        >
          {report.topPages.length === 0 ? (
            <SectionEmpty
              icon={<FileText className="size-5" />}
              title="No page views yet"
              description="The most visited marketing pages will rank here."
            />
          ) : (
            <RankedList
              total={totals.visits}
              items={report.topPages.map((p) => ({
                key: p.path,
                label: <span className="font-mono">{p.path}</span>,
                count: p.visits,
              }))}
            />
          )}
        </GlassSection>
        <GlassSection
          title="UTM campaigns"
          subtitle="Visits tagged with utm_campaign"
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
              items={report.campaigns.map((c) => ({
                key: c.campaign,
                label: c.campaign,
                count: c.visits,
              }))}
            />
          )}
        </GlassSection>
      </div>

      <RecentVisitsTable />
    </div>
  );
}
