"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Banner, Button, Chip } from "@galyan/ui";
import { DownloadCloud, Plus } from "lucide-react";
import { AdminHero } from "@/components/layout/common/hero";
import { AdminLoadError, AdminPageSkeleton } from "@/components/layout/common/states";
import { useFeatureFlagsContext } from "@/features/feature-flags/context";
import { FeatureKpis } from "@/features/feature-flags/components/feature-kpis";
import { FeatureCatalog } from "@/features/feature-flags/components/feature-catalog";

const FeatureFormModal = dynamic(
  () =>
    import("@/features/feature-flags/components/feature-form-modal").then(
      (m) => m.FeatureFormModal,
    ),
  { ssr: false },
);

const DeleteFeatureModal = dynamic(
  () =>
    import("@/features/feature-flags/components/delete-feature-modal").then(
      (m) => m.DeleteFeatureModal,
    ),
  { ssr: false },
);

export const FeatureFlagsContent = () => {
  const {
    overview,
    loadError,
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
    <div className="space-y-4">
      <AdminHero
        title="Feature flags"
        description="What Simantrix sells: each feature, the plan that unlocks it, add-on pricing, and whether it is live for organizations."
        chips={
          !canManage && (
            <Chip variant="warning" size="sm">
              Read-only
            </Chip>
          )
        }
        actions={
          canManage && (
            <div className="flex flex-wrap items-center gap-2">
              {missing > 0 && summary.totalFeatures > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={importing}
                  leftIcon={<DownloadCloud className="size-3.5" />}
                  onClick={importDefaults}
                  className="w-full sm:w-auto"
                >
                  Import {missing} built-in
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-3.5" />}
                onClick={openCreate}
                className="w-full sm:w-auto"
              >
                Add feature
              </Button>
            </div>
          )
        }
        updatedAt={overview.generatedAt}
      />

      <FeatureKpis />

      {orphans.length > 0 && (
        <Banner
          variant="info"
          size="sm"
          bannerStyle="subtle"
          title={`${orphans.length} feature key${orphans.length === 1 ? " is" : "s are"} used by organizations but missing from the catalog`}
          description={`${orphans
            .slice(0, 6)
            .map((o) => `${o.featureKey} (${o.organizations})`)
            .join(", ")}${orphans.length > 6 ? ", …" : ""}. Add ${orphans.length === 1 ? "it" : "them"} to manage ${orphans.length === 1 ? "it" : "them"} here.`}
        />
      )}

      <FeatureCatalog />

      <FeatureFormModal />
      <DeleteFeatureModal />
    </div>
  );
};
