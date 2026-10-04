"use client";

import { Banner, Button, Chip, Tabs } from "@galyan/ui";
import { Eye, Plus, ShieldCheck } from "lucide-react";
import {
  AdminHero,
  AdminLoadError,
  AdminPageSkeleton,
  StaleDataBanner,
} from "@/components/admin";
import { useSettingsContext } from "../context";
import type { CategoryTab } from "../types";
import { CATEGORY_META } from "../common/constants";
import { SettingsKpis } from "./settings-kpis";
import { SettingsCategorySection } from "./settings-category-section";
import { AddSettingModal } from "./add-setting-modal";
import { EditSettingModal } from "./edit-setting-modal";
import { DeleteSettingModal } from "./delete-setting-modal";

/** Platform Settings page: hero, KPIs, category tabs, one glass section per category, dialogs. */
export function SettingsContent() {
  const { state, canEdit, load, setActiveTab, openAdd } = useSettingsContext();
  const { data } = state;

  if (state.loading && !data) return <AdminPageSkeleton />;
  if (!data) {
    return (
      <AdminLoadError
        title="Platform settings unavailable"
        message={state.loadError ?? "Could not load platform settings."}
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
    <div className="space-y-6">
      <AdminHero
        title="Platform Settings"
        description="Platform-wide configuration that applies to every organization. Built-in settings show their default until you change them; secret values are write-only."
        chips={
          canEdit ? (
            <Chip size="sm" variant="success" icon={<ShieldCheck className="size-3" />}>
              <span className="whitespace-nowrap">Superadmin · can edit</span>
            </Chip>
          ) : (
            <Chip size="sm" variant="neutral" icon={<Eye className="size-3" />}>
              <span className="whitespace-nowrap">Read-only</span>
            </Chip>
          )
        }
        actions={
          canEdit && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="size-3.5" />}
              onClick={openAdd}
            >
              Add setting
            </Button>
          )
        }
        onRefresh={() => void load()}
        refreshing={state.refreshing}
        updatedAt={state.fetchedAt}
      />

      {state.refreshError && <StaleDataBanner error={state.refreshError} />}
      {!canEdit && (
        <Banner
          variant="info"
          size="sm"
          bannerStyle="subtle"
          description="Only superadmins can change platform settings. You can review the current values."
        />
      )}

      <SettingsKpis summary={data.summary} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          items={tabs}
          activeTab={state.activeTab}
          onTabChange={(id) => setActiveTab(id as CategoryTab)}
          variant="button"
          size="sm"
        />
        {unsaved > 0 && (
          <Chip size="sm" variant="warning">
            <span className="whitespace-nowrap">
              {unsaved} unsaved {unsaved === 1 ? "change" : "changes"}
            </span>
          </Chip>
        )}
      </div>

      <div className="space-y-6">
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
}
