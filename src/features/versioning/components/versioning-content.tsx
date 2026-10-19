"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Button, Chip } from "@galyan/ui";
import { Laptop, Plus, ShieldCheck } from "lucide-react";
import { AdminHero } from "@/components/layout/common/hero";
import { AdminLoadError, AdminPageSkeleton } from "@/components/layout/common/states";
import { useVersioningContext } from "@/features/versioning/context";
import { CurrentVersions } from "@/features/versioning/components/current-versions";
import { ReleasesSection } from "@/features/versioning/components/releases-section";
import { VersioningKpis } from "@/features/versioning/components/versioning-kpis";

const ReleaseFormModal = dynamic(
  () =>
    import("@/features/versioning/components/release-form-modal").then(
      (m) => m.ReleaseFormModal,
    ),
  { ssr: false },
);

const ReleaseActionModal = dynamic(
  () =>
    import("@/features/versioning/components/release-action-modal").then(
      (m) => m.ReleaseActionModal,
    ),
  { ssr: false },
);

export const VersioningContent = () => {
  const { state, summary, canManage, openDialog, refresh } = useVersioningContext();

  if (!state.loaded) {
    return state.error ? (
      <AdminLoadError title="Versioning registry unavailable" message={state.error} onRetry={refresh} />
    ) : (
      <AdminPageSkeleton />
    );
  }

  const desktopCount = summary?.byApp?.DESKTOP ?? 0;
  const stableRelease = summary?.current?.find(
    (r) => r.app === "DESKTOP" && r.channel === "STABLE",
  );

  return (
    <div className="space-y-4">
      <AdminHero
        title="Simantrix App Versioning"
        description="Dedicated release management, progressive canary rollouts, update channels, and installer distribution for the Simantrix Desktop App (Electron 43)."
        chips={
          <>
            <Chip variant="soft" size="sm" icon={<Laptop className="size-3 text-[var(--gy-primary)]" />}>
              Simantrix Desktop (Electron 43)
            </Chip>
            {stableRelease && (
              <Chip variant="success" size="sm">
                v{stableRelease.version} Live (Stable)
              </Chip>
            )}
            <Chip variant="neutral" size="sm">
              {desktopCount} Desktop Builds Tracked
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
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="size-3.5" />}
              onClick={() => openDialog({ kind: "create" })}
            >
              New Desktop Release
            </Button>
          )
        }
        updatedAt={summary?.generatedAt}
      />

      <VersioningKpis />
      <CurrentVersions />
      <ReleasesSection />

      <ReleaseFormModal />
      <ReleaseActionModal />
    </div>
  );
};
