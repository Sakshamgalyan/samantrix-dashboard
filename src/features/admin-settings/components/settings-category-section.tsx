"use client";

import React from "react";
import { Chip, Typography } from "@galyan/ui";
import { SlidersHorizontal } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import type { PlatformSetting, SettingCategory } from "@/features/admin-settings/types/api";
import { CATEGORY_META } from "@/features/admin-settings/common/constants";
import { SettingRow } from "@/features/admin-settings/components/setting-row";

interface SettingsCategorySectionProps {
  category: SettingCategory;
  settings: PlatformSetting[];
}

/** Glass section listing every setting of one category. */
export const SettingsCategorySection = ({
  category,
  settings,
}: SettingsCategorySectionProps) => {
  const meta = CATEGORY_META[category];
  const customised = settings.filter((s) => !s.isDefault).length;

  return (
    <GlassSection
      title={meta.label}
      subtitle={meta.subtitle}
      aside={
        settings.length > 0 && (
          <Chip size="sm" variant="neutral">
            <Typography variant="small" textColor="var(--gy-text-secondary)" className="whitespace-nowrap text-xs">
              {customised} of {settings.length} stored
            </Typography>
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
};

