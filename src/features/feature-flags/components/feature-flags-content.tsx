"use client";

import React from "react";
import { Banner, Button, Chip } from "@galyan/ui";
import { DownloadCloud, Plus } from "lucide-react";
import {
  AdminHero,
  AdminLoadError,
  AdminPageSkeleton,
  StaleDataBanner,
} from "@/components/admin";
import { formatNumber } from "@/lib/format";
import { useFeatureFlagsContext } from "../context";
import { FeatureKpis } from "./feature-kpis";
import { FeatureTable } from "./feature-table";
import { FeatureFormModal } from "./feature-form-modal";
import { DeleteFeatureModal } from "./delete-feature-modal";

export function FeatureFlagsContent() {
  const {
    overview,
    loadError,
    refreshing,
    refresh,
    canManage,
    openCreate,
    importDefaults,
    importing,
  } = useFeatureFlagsContext();

  if (!overview) {
    return loadError ? (
      <AdminLoadError
        title="Feature catalog unavailable"
        message={loadError}
        onRetry={refresh}
      />
    ) : (
      <AdminPageSkeleton />
    );
  }

  const { summary } = overview;
  const missing = summary.missingDefaults.length;
  const orphans = summary.orphanKeys;

  return (
    <div className="space-y-6">
      {loadError && <StaleDataBanner error={loadError} />}

      <AdminHero
        title="Feature flags"
        description="The platform-wide feature catalog: what each feature is called, which plan unlocks it, whether new organizations get it switched on, and how many organizations actually use it."
        chips={
          <>
            <Chip variant="soft" size="sm">
              Platform catalog
            </Chip>
            <Chip variant="neutral" size="sm">
              {formatNumber(summary.totalOrganizations)} live organization
              {summary.totalOrganizations === 1 ? "" : "s"}
            </Chip>
            {!canManage && (
              <Chip variant="warning" size="sm">
                Read-only
              </Chip>
            )}
          </>
        }
        actions={
          canManage && (
            <>
              {missing > 0 && summary.totalFeatures > 0 && (
                <Button
                  variant="glass"
                  size="sm"
                  isLoading={importing}
                  leftIcon={<DownloadCloud className="size-3.5" />}
                  onClick={importDefaults}
                >
                  Import {missing} built-in
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-3.5" />}
                onClick={openCreate}
              >
                Add feature
              </Button>
            </>
          )
        }
        onRefresh={refresh}
        refreshing={refreshing}
        updatedAt={overview.generatedAt}
      />

      <FeatureKpis />

      {orphans.length > 0 && (
        <Banner
          variant="info"
          size="sm"
          bannerStyle="subtle"
          title={`${orphans.length} feature key${orphans.length === 1 ? " is" : "s are"} stored on organizations but not in the catalog`}
          description={`${orphans
            .slice(0, 6)
            .map((o) => `${o.featureKey} (${o.organizations})`)
            .join(
              ", ",
            )}${orphans.length > 6 ? ", …" : ""}. Add ${orphans.length === 1 ? "it" : "them"} to the catalog to manage ${orphans.length === 1 ? "it" : "them"} here.`}
        />
      )}

      <FeatureTable />

      <FeatureFormModal />
      <DeleteFeatureModal />
    </div>
  );
}
