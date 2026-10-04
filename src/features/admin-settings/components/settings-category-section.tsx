"use client";

import { Chip } from "@galyan/ui";
import { SlidersHorizontal } from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import type { PlatformSetting, SettingCategory } from "../types";
import { CATEGORY_META } from "../common/constants";
import { SettingRow } from "./setting-row";

interface SettingsCategorySectionProps {
  category: SettingCategory;
  settings: PlatformSetting[];
}

/** Glass section listing every setting of one category. */
export function SettingsCategorySection({
  category,
  settings,
}: SettingsCategorySectionProps) {
  const meta = CATEGORY_META[category];
  const customised = settings.filter((s) => !s.isDefault).length;

  return (
    <GlassSection
      title={meta.label}
      subtitle={meta.subtitle}
      aside={
        settings.length > 0 && (
          <Chip size="sm" variant="neutral">
            <span className="whitespace-nowrap">
              {customised} of {settings.length} stored
            </span>
          </Chip>
        )
      }
    >
      {settings.length === 0 ? (
        <SectionEmpty
          icon={<SlidersHorizontal className="size-5" />}
          title={`No ${meta.label.toLowerCase()} settings yet`}
          description="Custom settings added to this category appear here."
        />
      ) : (
        <div className="space-y-3">
          {settings.map((s) => (
            <SettingRow key={s.key} setting={s} />
          ))}
        </div>
      )}
    </GlassSection>
  );
}
