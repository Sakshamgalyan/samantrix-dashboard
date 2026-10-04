"use client";

import React from "react";
import {
  Button,
  Chip,
  Input,
  ProgressBar,
  Table,
  Tabs,
  Toggle,
  Tooltip,
  type Column,
} from "@galyan/ui";
import { DownloadCloud, Flag, Pencil, Search, Trash2 } from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import { ALL_CATEGORIES, PLAN_META } from "../common/constants";
import { useFeatureFlagsContext } from "../context";
import type { FeatureFlag } from "../types";

function AdoptionCell({ row }: { row: FeatureFlag }) {
  if (row.eligible === 0) {
    return (
      <span className="text-xs text-[var(--gy-text-subtle)]">
        No organization on this plan yet
      </span>
    );
  }
  const enabledEligible = row.enabled - row.enabledOutsidePlan;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold text-[var(--gy-text)]">
          {row.adoptionPercent ?? 0}%
        </span>
        <span className="truncate text-[var(--gy-text-subtle)]">
          {enabledEligible} of {row.eligible} eligible
        </span>
      </div>
      <ProgressBar
        progress={row.adoptionPercent ?? 0}
        size="sm"
        variant="primary"
      />
      {row.enabledOutsidePlan > 0 && (
        <Tooltip
          content="These organizations have it switched on although their plan is below the minimum tier."
          position="top"
          size="sm"
        >
          <span className="whitespace-nowrap text-[11px] font-medium text-[var(--gy-warning)]">
            +{row.enabledOutsidePlan} on below plan
          </span>
        </Tooltip>
      )}
    </div>
  );
}

export function FeatureTable() {
  const {
    overview,
    visibleFeatures,
    category,
    search,
    setCategory,
    setSearch,
    canManage,
    togglingKey,
    toggleDefault,
    openEdit,
    openDelete,
    importDefaults,
    importing,
  } = useFeatureFlagsContext();
  if (!overview) return null;
  const { summary } = overview;

  const tabs = [
    { id: ALL_CATEGORIES, label: `All · ${summary.totalFeatures}` },
    ...summary.categories.map((c) => ({
      id: c.category,
      label: `${c.category} · ${c.count}`,
    })),
  ];

  const columns: Column<FeatureFlag>[] = [
    {
      key: "name",
      header: "Feature",
      accessor: (row) => (
        <div className="min-w-0 py-0.5">
          <div className="truncate text-sm font-semibold text-[var(--gy-text)]">
            {row.name}
          </div>
          <code className="block truncate font-mono text-[11px] text-[var(--gy-primary)]">
            {row.featureKey}
          </code>
          {row.description && (
            <div className="mt-0.5 line-clamp-1 text-xs text-[var(--gy-text-secondary)]">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: "130px",
      accessor: (row) => (
        <span className="whitespace-nowrap text-sm text-[var(--gy-text)]">
          {row.category}
        </span>
      ),
    },
    {
      key: "minPlanTier",
      header: "Min plan",
      width: "130px",
      accessor: (row) => (
        <Chip size="sm" variant={PLAN_META[row.minPlanTier].variant}>
          <span className="whitespace-nowrap">
            {PLAN_META[row.minPlanTier].label}
          </span>
        </Chip>
      ),
    },
    {
      key: "defaultEnabled",
      header: "Default",
      width: "100px",
      accessor: (row) => (
        <Toggle
          size="sm"
          checked={row.defaultEnabled}
          disabled={!canManage || togglingKey !== null}
          onChange={(e) => toggleDefault(row, e.target.checked)}
          aria-label={`${row.name} on by default`}
        />
      ),
    },
    {
      key: "adoption",
      header: "Adoption",
      width: "200px",
      accessor: (row) => <AdoptionCell row={row} />,
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "",
            width: "96px",
            align: "right" as const,
            accessor: (row: FeatureFlag) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="glass"
                  size="xs"
                  aria-label={`Edit ${row.name}`}
                  onClick={() => openEdit(row)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="danger-soft"
                  size="xs"
                  aria-label={`Delete ${row.name}`}
                  onClick={() => openDelete(row)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <GlassSection
      title="Feature catalog"
      subtitle="Default applies to newly created organizations; adoption counts organizations whose plan includes the feature."
    >
      {summary.totalFeatures === 0 ? (
        <div className="space-y-2">
          <SectionEmpty
            icon={<Flag className="size-5" />}
            title="The feature catalog is empty"
            description={
              summary.missingDefaults.length
                ? `${summary.missingDefaults.length} built-in Samantrix features aren't in the database catalog yet. Import them or add your own.`
                : "Add a feature to start managing it here."
            }
          />
          {canManage && summary.missingDefaults.length > 0 && (
            <div className="flex justify-center pb-6">
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
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0 overflow-x-auto">
              <Tabs
                items={tabs}
                activeTab={category}
                onTabChange={setCategory}
                variant="button"
                size="sm"
              />
            </div>
            <div className="w-full shrink-0 lg:w-72">
              <Input
                size="sm"
                placeholder="Search key, name or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="size-3.5" />}
                clearable
                onClear={() => setSearch("")}
                fullWidth
                aria-label="Search features"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table<FeatureFlag>
              columns={columns}
              data={visibleFeatures}
              rowKey={(row) => row.id}
              hoverable
              size="md"
              emptyStateLabel="No features match"
              emptyStateMessage="Try another category or search term."
            />
          </div>
        </div>
      )}
    </GlassSection>
  );
}
