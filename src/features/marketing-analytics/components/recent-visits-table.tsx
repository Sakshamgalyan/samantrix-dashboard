"use client";

import { Banner, Chip, Table, type Column } from "@galyan/ui";
import { Monitor, MousePointerClick, Smartphone, Tablet } from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import { formatDateTime, formatNumber, relativeTime } from "@/lib/format";
import { useMarketingContext } from "../context";
import type { VisitorLogRow } from "../types";

function DeviceIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  const Icon = t === "mobile" ? Smartphone : t === "tablet" ? Tablet : Monitor;
  return <Icon className="size-3.5 shrink-0 text-[var(--gy-text-subtle)]" />;
}

/** Where a visit came from: campaign/UTM first, then the referrer host, else Direct. */
function sourceLabel(row: VisitorLogRow): string {
  if (row.utmSource) return row.utmSource;
  if (!row.referrer) return "Direct";
  try {
    return new URL(row.referrer).hostname.replace(/^www\./, "");
  } catch {
    return row.referrer;
  }
}

const columns: Column<VisitorLogRow>[] = [
  {
    key: "path",
    header: "Page",
    accessor: (row) => (
      <div className="min-w-0">
        <div className="truncate font-mono text-sm text-[var(--gy-text)]">
          {row.path}
        </div>
        <div className="truncate text-xs text-[var(--gy-text-subtle)]">
          Visitor {row.visitorId.slice(0, 8)}
        </div>
      </div>
    ),
  },
  {
    key: "location",
    header: "Location",
    width: "180px",
    accessor: (row) => (
      <span className="block truncate text-sm text-[var(--gy-text)]">
        {[row.city, row.country].filter(Boolean).join(", ") || "Unknown"}
      </span>
    ),
  },
  {
    key: "device",
    header: "Device",
    width: "190px",
    accessor: (row) => (
      <div className="flex min-w-0 items-center gap-1.5 text-sm text-[var(--gy-text)]">
        <DeviceIcon type={row.deviceType} />
        <span className="truncate">
          {[row.browser, row.os].filter(Boolean).join(" · ") || row.deviceType}
        </span>
      </div>
    ),
  },
  {
    key: "source",
    header: "Source",
    width: "170px",
    accessor: (row) => (
      <div className="flex min-w-0 flex-col items-start gap-0.5">
        <Chip
          size="sm"
          variant={row.utmSource ? "solid" : "soft"}
          className="max-w-full whitespace-nowrap"
        >
          <span className="block max-w-[130px] truncate">
            {sourceLabel(row)}
          </span>
        </Chip>
        {row.utmCampaign && (
          <span className="max-w-full truncate text-[11px] text-[var(--gy-text-subtle)]">
            {row.utmCampaign}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "createdAt",
    header: "When",
    width: "130px",
    accessor: (row) => (
      <span
        className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]"
        title={formatDateTime(row.createdAt)}
      >
        {relativeTime(row.createdAt)}
      </span>
    ),
  },
];

/** Latest tracked page views, newest first, paged on the server. */
export function RecentVisitsTable() {
  const { state, setVisitsPage } = useMarketingContext();
  const { visits, visitsError, visitsLoading } = state;
  const meta = visits?.meta;

  return (
    <GlassSection
      title="Recent visits"
      subtitle={
        meta && meta.total > 0
          ? `${formatNumber(meta.total)} page views tracked in total, newest first`
          : "Latest page views from the marketing site"
      }
    >
      {visitsError && (
        <div className="mb-3">
          <Banner
            variant="warning"
            size="sm"
            bannerStyle="subtle"
            description={visitsError}
          />
        </div>
      )}
      {visits && meta && meta.total === 0 ? (
        <SectionEmpty
          icon={<MousePointerClick className="size-5" />}
          title="No visits tracked yet"
          description="Each page view on samantrix-home is recorded through the gateway and listed here."
        />
      ) : (
        <Table
          columns={columns}
          data={visits?.data ?? []}
          rowKey={(row) => row.id}
          size="sm"
          hoverable
          isLoading={!visits || visitsLoading}
          skeletonRows={5}
          pagination={
            meta && meta.totalPages > 1
              ? {
                  currentPage: meta.page,
                  totalPages: meta.totalPages,
                  totalItems: meta.total,
                  itemsPerPage: meta.limit,
                }
              : false
          }
          onPageChange={setVisitsPage}
          ariaLabel="Recent marketing site visits"
        />
      )}
    </GlassSection>
  );
}
