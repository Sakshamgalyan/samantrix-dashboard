"use client";

import React from "react";
import {
  Button,
  Chip,
  Dropdown,
  Input,
  ProgressBar,
  Toggle,
  Tooltip,
} from "@galyan/ui";
import { DownloadCloud, Flag, Pencil, Search, Trash2 } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { formatMoney } from "@/utils/format";
import {
  ALL_CATEGORIES,
  PLAN_META,
  getFeatureIcon,
} from "@/features/feature-flags/common/constants";
import { useFeatureFlagsContext } from "@/features/feature-flags/context";
import type { FeatureFlag } from "@/features/feature-flags/types";

const Adoption = ({ row }: { row: FeatureFlag }) => {
  if (row.eligible === 0) {
    return (
      <div className="w-full md:w-36 py-1">
        <span className="text-[11px] text-[var(--gy-text-subtle)]">
          No orgs on this plan
        </span>
      </div>
    );
  }
  const enabledEligible = row.enabled - row.enabledOutsidePlan;
  return (
    <div className="w-full md:w-36 space-y-1 py-1">
      <div className="flex items-baseline justify-between gap-2 text-[11px]">
        <span className="font-semibold text-[var(--gy-text)]">
          {row.adoptionPercent ?? 0}%
        </span>
        <span className="truncate text-[var(--gy-text-subtle)]">
          {enabledEligible}/{row.eligible} orgs
        </span>
      </div>
      <ProgressBar progress={row.adoptionPercent ?? 0} size="sm" variant="primary" />
      {row.enabledOutsidePlan > 0 && (
        <Tooltip
          content="Switched on for organizations whose plan is below the minimum tier."
          position="top"
          size="sm"
        >
          <span className="whitespace-nowrap text-[10px] font-medium text-[var(--gy-warning)] block mt-0.5">
            +{row.enabledOutsidePlan} below plan
          </span>
        </Tooltip>
      )}
    </div>
  );
};

const FeatureRow = ({ row }: { row: FeatureFlag }) => {
  const { canManage, togglingKey, toggleDefault, toggleGlobal, openEdit, openDelete } =
    useFeatureFlagsContext();
  const busy = togglingKey !== null;
  const IconComp = getFeatureIcon(row.featureKey, row.category);

  return (
    <div
      className={`${GLASS_ROW} flex flex-col gap-3 px-3 py-2.5 md:grid md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center ${
        row.isEnabled ? "" : "opacity-60"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)] mt-0.5">
          <IconComp className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-[var(--gy-text)]">
              {row.name}
            </span>
            <Chip size="xs" variant={PLAN_META[row.minPlanTier].variant}>
              {PLAN_META[row.minPlanTier].label}+
            </Chip>
            {row.isBeta && (
              <Chip size="xs" variant="warning">
                Beta
              </Chip>
            )}
            {row.addonPriceMonthly !== null && (
              <Chip size="xs" variant="primary">
                Add-on {formatMoney(row.addonPriceMonthly, "INR")}/mo
              </Chip>
            )}
            {!row.isEnabled && (
              <Chip size="xs" variant="danger">
                Off everywhere
              </Chip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <code className="block truncate font-mono text-[11px] text-[var(--gy-primary)]">
              {row.featureKey}
            </code>
            {row.category && (
              <span className="text-[11px] text-[var(--gy-text-subtle)]">
                · {row.category}
              </span>
            )}
          </div>
          {row.description && (
            <p className="line-clamp-2 text-xs text-[var(--gy-text-secondary)]">
              {row.description}
            </p>
          )}
        </div>
      </div>

      <Adoption row={row} />

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 border-t border-[var(--gy-border)]/40 md:border-t-0 md:pt-0">
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--gy-text-secondary)] cursor-pointer">
          Default
          <Toggle
            size="sm"
            checked={row.defaultEnabled}
            disabled={!canManage || busy}
            onChange={(e) => toggleDefault(row, e.target.checked)}
            aria-label={`${row.name} on by default for new organizations`}
          />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--gy-text-secondary)] cursor-pointer">
          Live
          <Toggle
            size="sm"
            checked={row.isEnabled}
            disabled={!canManage || busy}
            onChange={(e) => toggleGlobal(row, e.target.checked)}
            aria-label={`${row.name} available to organizations`}
          />
        </label>
        {canManage && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              aria-label={`Edit ${row.name}`}
              leftIcon={<Pencil className="size-3" />}
              onClick={() => openEdit(row)}
            >
              Edit
            </Button>
            <Button
              variant="danger-soft"
              size="xs"
              aria-label={`Delete ${row.name}`}
              leftIcon={<Trash2 className="size-3" />}
              onClick={() => openDelete(row)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/** The catalog grouped by category, with search and a category filter. */
export const FeatureCatalog = () => {
  const {
    overview,
    groupedFeatures,
    category,
    search,
    setCategory,
    setSearch,
    canManage,
    importDefaults,
    importing,
  } = useFeatureFlagsContext();
  if (!overview) return null;
  const { summary } = overview;

  if (summary.totalFeatures === 0) {
    return (
      <GlassSection title="Feature catalog">
        <SectionEmpty
          icon={<Flag className="size-5" />}
          title="The feature catalog is empty"
          description={
            summary.missingDefaults.length
              ? `${summary.missingDefaults.length} built-in Simantrix features aren't in the catalog yet. Import them or add your own.`
              : "Add a feature to start managing it here."
          }
        />
        {canManage && summary.missingDefaults.length > 0 && (
          <div className="flex justify-center pb-4">
            <Button
              variant="primary"
              size="sm"
              isLoading={importing}
              leftIcon={<DownloadCloud className="size-3.5" />}
              onClick={importDefaults}
            >
              Import built-in features
            </Button>
          </div>
        )}
      </GlassSection>
    );
  }

  const categoryOptions = [
    { value: ALL_CATEGORIES, label: `All categories · ${summary.totalFeatures}` },
    ...summary.categories.map((c) => ({ value: c.category, label: `${c.category} · ${c.count}` })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="w-full sm:flex-1">
          <Input
            size="sm"
            placeholder="Search name, key or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="size-3.5" />}
            clearable
            onClear={() => setSearch("")}
            className="w-full"
            aria-label="Search features"
          />
        </div>
        <div className="w-full sm:w-64">
          <Dropdown
            size="sm"
            options={categoryOptions}
            value={category}
            onChange={(v) => setCategory(v as string)}
            aria-label="Category"
          />
        </div>
      </div>

      {groupedFeatures.length === 0 ? (
        <GlassSection title="No features match">
          <SectionEmpty
            icon={<Search className="size-5" />}
            title="No features match"
            description="Try another category or search term."
          />
        </GlassSection>
      ) : (
        groupedFeatures.map((group) => (
          <GlassSection
            key={group.category}
            title={group.category}
            subtitle={`${group.features.length} feature${group.features.length === 1 ? "" : "s"}`}
          >
            <div className="space-y-2">
              {group.features.map((row) => (
                <FeatureRow key={row.id} row={row} />
              ))}
            </div>
          </GlassSection>
        ))
      )}
    </div>
  );
};
