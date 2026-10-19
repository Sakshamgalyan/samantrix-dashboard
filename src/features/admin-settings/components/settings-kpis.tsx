"use client";

import { Clock, Database, KeyRound, Layers } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { formatDateTime, relativeTime } from "@/utils/format";
import type { PlatformSettingsSummary } from "@/features/admin-settings/types/api";

/** KPI row: stored settings, defaults in use, secrets held, last change. */
export const SettingsKpis = ({ summary }: { summary: PlatformSettingsSummary }) => {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Settings configured"
        value={summary.configured}
        caption={`stored values out of ${summary.total} settings`}
        icon={<Database className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Using defaults"
        value={summary.usingDefaults}
        caption="built-in settings never changed"
        icon={<Layers className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Secrets stored"
        value={summary.secretsStored}
        caption="write-only, never shown again"
        icon={<KeyRound className="size-4" />}
        tone="warning"
      />
      <KpiCard
        label="Last updated"
        value={
          summary.lastUpdatedAt ? relativeTime(summary.lastUpdatedAt) : "Never"
        }
        caption={
          summary.lastUpdatedAt
            ? formatDateTime(summary.lastUpdatedAt)
            : "no setting has been stored yet"
        }
        icon={<Clock className="size-4" />}
        tone="success"
      />
    </div>
  );
}
