"use client";

import dynamic from "next/dynamic";
import { Button, Chip, Tabs, Typography } from "@galyan/ui";
import { Eye, Plus, ShieldCheck } from "lucide-react";
import { AdminLoadError, AdminPageSkeleton } from "@/components/layout/common/states";
import { useSettingsContext } from "@/features/admin-settings/context";
import type { CategoryTab } from "@/features/admin-settings/types/state";
import { CATEGORY_META } from "@/features/admin-settings/common/constants";
import { SettingsKpis } from "@/features/admin-settings/components/settings-kpis";
import { SettingsCategorySection } from "@/features/admin-settings/components/settings-category-section";

const AddSettingModal = dynamic(
  () =>
    import("@/features/admin-settings/components/add-setting-modal").then(
      (m) => m.AddSettingModal
    ),
  { ssr: false }
);

const EditSettingModal = dynamic(
  () =>
    import("@/features/admin-settings/components/edit-setting-modal").then(
      (m) => m.EditSettingModal
    ),
  { ssr: false }
);

const DeleteSettingModal = dynamic(
  () =>
    import("@/features/admin-settings/components/delete-setting-modal").then(
      (m) => m.DeleteSettingModal
    ),
  { ssr: false }
);

/** Configuration tab: KPIs, category tabs, one section per category, dialogs (superadmins only). */
export const SettingsContent = () => {
  const { state, canEdit, load, setActiveTab, openAdd } = useSettingsContext();
  const { data } = state;

  if (state.loading && !data) return <AdminPageSkeleton />;
  if (!data) {
    return (
      <AdminLoadError
        title="Configuration unavailable"
        message={state.loadError ?? "Could not load the configuration."}
        onRetry={() => void load()}
      />
    );
  }

  const total = data.summary.total;
  const unsaved = Object.keys(state.drafts).length;
  const tabs = [
    { id: "ALL", label: `All · ${total}` },
    ...data.categories.map((c) => ({
      id: c.category,
      label: `${CATEGORY_META[c.category].label} · ${c.settings.length}`,
    })),
  ];
  const visible =
    state.activeTab === "ALL"
      ? data.categories.filter((c) => c.settings.length > 0)
      : data.categories.filter((c) => c.category === state.activeTab);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography variant="span" className="text-xs text-[var(--gy-text-secondary)]">
          {total} configuration {total === 1 ? "key" : "keys"} registered
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? (
            <Chip size="sm" variant="success" icon={<ShieldCheck className="size-3" />}>
              <span className="whitespace-nowrap">Superadmin · can edit</span>
            </Chip>
          ) : (
            <Chip size="sm" variant="neutral" icon={<Eye className="size-3" />}>
              <span className="whitespace-nowrap">Read-only</span>
            </Chip>
          )}
          {canEdit && (
            <Button variant="primary" size="sm" leftIcon={<Plus className="size-3.5" />} onClick={openAdd}>
              Add setting
            </Button>
          )}
        </div>
      </div>

      <SettingsKpis summary={data.summary} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <Tabs
            items={tabs}
            activeTab={state.activeTab}
            onTabChange={(id) => setActiveTab(id as CategoryTab)}
            variant="button"
            size="sm"
          />
        </div>
        {unsaved > 0 && (
          <Chip size="sm" variant="warning">
            <span className="whitespace-nowrap">
              {unsaved} unsaved {unsaved === 1 ? "change" : "changes"}
            </span>
          </Chip>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((c) => (
          <SettingsCategorySection
            key={c.category}
            category={c.category}
            settings={c.settings}
          />
        ))}
      </div>

      <AddSettingModal />
      <EditSettingModal />
      <DeleteSettingModal />
    </div>
  );
};
