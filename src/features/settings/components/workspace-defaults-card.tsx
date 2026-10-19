"use client";

import React from "react";
import { Card, CardHeader, CardBody, Button, Dropdown, Typography } from "@galyan/ui";
import { Globe, Save } from "lucide-react";
import { TIMEZONE_OPTIONS, LOCALE_OPTIONS } from "@/features/settings/common/constants";
import type { OrgSettings } from "@/types/dashboard";

export interface WorkspaceDefaultsCardProps {
  settingsForm: OrgSettings;
  canEdit: boolean;
  loading: boolean;
  saving: boolean;
  onChange: <K extends keyof OrgSettings>(field: K, value: OrgSettings[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const WorkspaceDefaultsCard = ({
  settingsForm,
  canEdit,
  loading,
  saving,
  onChange,
  onSubmit,
}: WorkspaceDefaultsCardProps) => {
  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="lg"
      isLoading={loading}
      skeletonLines={3}
      className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
    >
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-info,#3b82f6)]/10 text-[var(--gy-info,#3b82f6)] shrink-0">
            <Globe className="size-4.5" />
          </div>
          <div>
            <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-base sm:text-lg">
              Workspace locale &amp; defaults
            </Typography>
            <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm mt-0.5">
              Global date and time settings applied across your digital offices and calendar integrations.
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody className="mt-5">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Dropdown
              label="Workspace timezone"
              size="sm"
              options={TIMEZONE_OPTIONS}
              value={settingsForm.timezone}
              disabled={!canEdit}
              searchable
              onChange={(val) => onChange("timezone", val)}
            />
            <Dropdown
              label="Locale format"
              size="sm"
              options={LOCALE_OPTIONS}
              value={settingsForm.locale}
              disabled={!canEdit}
              onChange={(val) => onChange("locale", val)}
            />
          </div>

          {canEdit && (
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Save className="size-3.5" />}
                disabled={saving}
                isLoading={saving}
                loadingText="Saving settings..."
                className="w-full sm:w-auto"
              >
                Save locale defaults
              </Button>
            </div>
          )}
        </form>
      </CardBody>
    </Card>
  );
};
