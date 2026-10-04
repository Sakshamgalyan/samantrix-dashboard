"use client";

import { Ban, Building2, CheckCircle2, Hourglass } from "lucide-react";
import { KpiCard } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { useOrganizationsContext } from "../context";

export function OrganizationsKpis() {
  const { state } = useOrganizationsContext();
  const counts = state.data?.counts;
  if (!counts) return null;

  const share = (n: number) =>
    counts.total
      ? `${Math.round((n / counts.total) * 100)}% of organizations`
      : "no organizations yet";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total organizations"
        value={counts.total}
        caption={`${formatNumber(counts.newLast30d)} created in the last 30 days`}
        icon={<Building2 className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Active"
        value={counts.active}
        caption={share(counts.active)}
        icon={<CheckCircle2 className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="On trial"
        value={counts.trial}
        caption={share(counts.trial)}
        icon={<Hourglass className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Suspended"
        value={counts.suspended}
        caption={
          counts.pending || counts.cancelled
            ? `${counts.pending} pending · ${counts.cancelled} cancelled`
            : "suspended by a platform admin"
        }
        icon={<Ban className="size-4" />}
        tone="danger"
      />
    </div>
  );
}
