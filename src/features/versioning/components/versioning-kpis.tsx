"use client";

import { KpiCard } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { Boxes, CalendarClock, Gauge, Undo2 } from "lucide-react";
import { APP_META } from "../common/constants";
import { useVersioningContext } from "../context";
import { RELEASE_APPS } from "../types";

export function VersioningKpis() {
  const { summary } = useVersioningContext();
  if (!summary) return null;

  const rolling = summary.rollingOut;
  const rollingCaption =
    rolling.length === 0
      ? "no staged rollouts"
      : rolling
          .slice(0, 2)
          .map(
            (r) => `${APP_META[r.app].label} ${r.version} · ${r.rolloutPercent}%`,
          )
          .join(", ") + (rolling.length > 2 ? ` +${rolling.length - 2}` : "");

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Apps with a live release"
        value={summary.appsLive}
        caption={`of ${RELEASE_APPS.length} Samantrix apps`}
        icon={<Boxes className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Rolling out now"
        value={summary.counts.ROLLING_OUT}
        caption={rollingCaption}
        icon={<Gauge className="size-4" />}
        tone="warning"
      />
      <KpiCard
        label="Releases in 30 days"
        value={summary.releasedLast30Days}
        caption={`shipped · ${formatNumber(summary.createdLast30Days)} created`}
        icon={<CalendarClock className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Rolled back"
        value={summary.counts.ROLLED_BACK}
        caption={`of ${formatNumber(summary.counts.total)} releases tracked`}
        icon={<Undo2 className="size-4" />}
        tone="danger"
      />
    </div>
  );
}
