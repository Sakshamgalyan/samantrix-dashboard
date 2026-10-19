"use client";

import React from "react";
import { Flag, Gauge, IndianRupee, Power } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { formatNumber } from "@/utils/format";
import { useFeatureFlagsContext } from "@/features/feature-flags/context";

/** Catalog metrics from GET /feature-flags summary. */
export const FeatureKpis = () => {
  const { overview } = useFeatureFlagsContext();
  if (!overview) return null;
  const { summary } = overview;
  const categories = summary.categories.length;
  const live = summary.totalFeatures - summary.globallyDisabled;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard
        label="Catalog features"
        value={summary.totalFeatures}
        caption={
          summary.totalFeatures
            ? `${categories} categor${categories === 1 ? "y" : "ies"} · ${summary.beta} in beta`
            : "nothing in the catalog yet"
        }
        icon={<Flag className="size-4" />}
        tone="primary"
      />
      <KpiCard
        label="Live"
        value={live}
        caption={
          summary.globallyDisabled
            ? `${summary.globallyDisabled} switched off everywhere`
            : `${summary.enabledByDefault} on by default for new orgs`
        }
        icon={<Power className="size-4" />}
        tone="success"
      />
      <KpiCard
        label="Paid add-ons"
        value={summary.paidAddons}
        caption={`${summary.planGated} gated to Starter or above`}
        icon={<IndianRupee className="size-4" />}
        tone="warning"
      />
      <KpiCard
        label="Average adoption"
        value={summary.averageAdoptionPercent === null ? "—" : `${summary.averageAdoptionPercent}%`}
        caption={`of eligible orgs · ${formatNumber(summary.totalOrganizations)} organization${summary.totalOrganizations === 1 ? "" : "s"}`}
        icon={<Gauge className="size-4" />}
        tone="info"
      />
    </div>
  );
};
