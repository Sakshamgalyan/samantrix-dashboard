"use client";

import React from "react";
import { Flag, Gauge, Lock, Power } from "lucide-react";
import { KpiCard } from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { useFeatureFlagsContext } from "../context";

/** Four real metrics from GET /feature-flags summary. */
export function FeatureKpis() {
  const { overview } = useFeatureFlagsContext();
  if (!overview) return null;
  const { summary } = overview;
  const categories = summary.categories.length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Catalog features"
        value={summary.totalFeatures}
        caption={
          summary.totalFeatures
            ? `across ${categories} categor${categories === 1 ? "y" : "ies"}`
            : "nothing in the catalog yet"
        }
        icon={<Flag className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="On by default"
        value={summary.enabledByDefault}
        caption={`${summary.totalFeatures - summary.enabledByDefault} start switched off`}
        icon={<Power className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Plan-gated"
        value={summary.planGated}
        caption="need Starter or a higher plan"
        icon={<Lock className="size-4" />}
        tone="warning"
      />
      <KpiCard
        label="Average adoption"
        value={
          summary.averageAdoptionPercent === null
            ? "—"
            : `${summary.averageAdoptionPercent}%`
        }
        caption={`of eligible orgs · ${formatNumber(summary.totalOrganizations)} live organization${summary.totalOrganizations === 1 ? "" : "s"}`}
        icon={<Gauge className="size-4" />}
        tone="info"
      />
    </div>
  );
}
