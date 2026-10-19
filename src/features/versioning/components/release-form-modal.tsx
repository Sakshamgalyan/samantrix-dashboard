"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@/lib/form-resolver";
import { skipToken } from "@reduxjs/toolkit/query/react";
import {
  Banner,
  Button,
  Dropdown,
  Input,
  Modal,
  Skeleton,
  Textarea,
  Toggle,
  Typography,
} from "@galyan/ui";
import { Laptop, Rocket } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { CHANNEL_META } from "@/features/versioning/common/constants";
import { useVersioningContext } from "@/features/versioning/context";
import {
  errorMessage,
  useGetReleaseQuery,
} from "@/features/versioning/context/api";
import {
  RELEASE_CHANNELS,
  releaseFormSchema,
  type Release,
  type ReleaseApp,
  type ReleaseFormValues,
} from "@/features/versioning/types";

const FORM_ID = "release-form";

const CHANNEL_OPTIONS = RELEASE_CHANNELS.map((c) => ({
  value: c,
  label: CHANNEL_META[c].label,
}));

const getInitialValues = (
  release: Release | null,
  defaultApp?: ReleaseApp,
): ReleaseFormValues => ({
  app: release?.app ?? defaultApp ?? "DESKTOP",
  version: release?.version ?? "",
  channel: release?.channel ?? "STABLE",
  title: release?.title ?? "",
  notes: release?.notes ?? "",
  isMandatory: release?.isMandatory ?? false,
  showOnHome: release?.showOnHome ?? true,
  summary: release?.summary ?? "",
  changes: release?.changes ?? [],
  downloadUrl: release?.downloadUrl ?? "",
  windowsUrl: release?.windowsUrl ?? "",
  macUrl: release?.macUrl ?? "",
  linuxUrl: release?.linuxUrl ?? "",
});

const ReleaseForm = ({
  release,
  defaultApp = "DESKTOP",
}: {
  release: Release | null;
  defaultApp?: ReleaseApp;
}) => {
  const { submitReleaseForm } = useVersioningContext();
  const coreLocked = release !== null && release.status !== "DRAFT";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReleaseFormValues>({
    resolver: zodResolver(releaseFormSchema),
    mode: "onTouched",
    defaultValues: getInitialValues(release, defaultApp),
  });

  return (
    <form
      id={FORM_ID}
      className="space-y-3.5"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await submitReleaseForm(values);
      })}
    >
      {/* Target Application & Version & Channel */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Fixed Desktop App Indicator */}
        <div className="flex flex-col gap-1 sm:col-span-1">
          <label className="text-xs font-medium text-[var(--gy-text)]">
            Application
          </label>
          <div className="flex items-center gap-2.5 rounded-lg border border-[var(--gy-border)] bg-[var(--gy-surface-subtle)] px-2.5 py-1.5 h-9">
            <div className="grid size-6 shrink-0 place-items-center rounded bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
              <Laptop className="size-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[var(--gy-text)] block truncate">
                Simantrix Desktop
              </span>
            </div>
          </div>
        </div>

        <Input
          label="Version (SemVer)"
          placeholder="1.0.0"
          fullWidth
          required
          disabled={coreLocked}
          className="[&_input]:font-mono"
          hasError={Boolean(errors.version)}
          error={errors.version?.message}
          {...register("version")}
        />

        <Controller
          control={control}
          name="channel"
          render={({ field }) => (
            <Dropdown
              label="Release Channel"
              options={CHANNEL_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v as string)}
              disabled={coreLocked}
            />
          )}
        />
      </div>

      <Input
        label="Release Title / Tagline"
        placeholder="e.g. Electron 43 Shell Performance & Native Tray Presence"
        fullWidth
        required
        disabled={coreLocked}
        hasError={Boolean(errors.title)}
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="space-y-2 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-subtle)] p-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--gy-text)] uppercase tracking-wider">
            Platform Binary Download Links
          </label>
          <span className="text-[0.7rem] text-[var(--gy-text-secondary)]">
            Handled live on simantrix-home/download
          </span>
        </div>

        <Input
          label="Windows Installer (.exe / .msi)"
          placeholder="https://releases.simantrix.com/desktop/Simantrix-Setup-x64.exe"
          fullWidth
          hasError={Boolean(errors.windowsUrl)}
          error={errors.windowsUrl?.message}
          {...register("windowsUrl")}
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            label="macOS Package (.dmg / .zip)"
            placeholder="https://releases.simantrix.com/desktop/Simantrix-mac-arm64.dmg"
            fullWidth
            hasError={Boolean(errors.macUrl)}
            error={errors.macUrl?.message}
            {...register("macUrl")}
          />

          <Input
            label="Linux Package (.AppImage / .deb)"
            placeholder="https://releases.simantrix.com/desktop/Simantrix-x86_64.AppImage"
            fullWidth
            hasError={Boolean(errors.linuxUrl)}
            error={errors.linuxUrl?.message}
            {...register("linuxUrl")}
          />
        </div>

        <Input
          label="Fallback / Store Download Link (Optional)"
          placeholder="https://releases.simantrix.com/desktop/latest"
          fullWidth
          hasError={Boolean(errors.downloadUrl)}
          error={errors.downloadUrl?.message}
          {...register("downloadUrl")}
        />
      </div>

      <Textarea
        label="Release Notes / Changelog"
        placeholder="Changelog, bug fixes, memory optimizations, and platform installer details..."
        fullWidth
        rows={4}
        hasError={Boolean(errors.notes)}
        error={errors.notes?.message}
        {...register("notes")}
      />

      <Controller
        control={control}
        name="isMandatory"
        render={({ field }) => (
          <div
            className={`${GLASS_ROW} flex items-center justify-between gap-3 px-3 py-2.5`}
          >
            <div>
              <div className="text-sm font-medium text-[var(--gy-text)]">
                Enforce Mandatory Desktop Update
              </div>
              <div className="text-xs text-[var(--gy-text-secondary)]">
                Older desktop app clients will require updating before logging
                in.
              </div>
            </div>
            <Toggle
              checked={field.value}
              disabled={coreLocked}
              onChange={(e) => field.onChange(e.target.checked)}
              aria-label="Enforce mandatory update"
            />
          </div>
        )}
      />
    </form>
  );
};

export const ReleaseFormModal = () => {
  const { state, closeDialog } = useVersioningContext();
  const dialog = state.dialog;
  const open = dialog?.kind === "create" || dialog?.kind === "edit";
  const release = dialog?.kind === "edit" ? dialog.release : null;
  const defaultApp = "DESKTOP";
  const shipped = release !== null && release.status !== "DRAFT";

  const detail = useGetReleaseQuery(release?.id ?? skipToken);
  const full =
    release && detail.currentData?.id === release.id
      ? detail.currentData
      : null;

  return (
    <Modal
      size="md"
      isOpen={open}
      onClose={closeDialog}
      icon={<Rocket className="size-5 text-[var(--gy-primary)]" />}
      title={
        release
          ? `Edit Desktop Release: v${release.version}`
          : "New Desktop Release"
      }
      subtitle={
        shipped
          ? "This desktop version is already active in production."
          : "Creates a new Electron desktop build draft. You can roll it out gradually or promote to 100% production."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeDialog}
            disabled={state.submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form={FORM_ID}
            isLoading={state.submitting}
            disabled={release !== null && !full}
          >
            {release ? "Save Changes" : "Create Desktop Release"}
          </Button>
        </div>
      }
    >
      {open &&
        (!release ? (
          <ReleaseForm key="new-desktop" release={null} defaultApp="DESKTOP" />
        ) : full ? (
          <ReleaseForm key={full.id} release={full} defaultApp="DESKTOP" />
        ) : detail.error ? (
          <Banner
            variant="danger"
            size="sm"
            bannerStyle="subtle"
            description={errorMessage(
              detail.error,
              "Couldn't load version details. Please try again.",
            )}
          />
        ) : (
          <div className="space-y-3">
            <Skeleton height="100px" />
            <Skeleton height="120px" />
          </div>
        ))}
    </Modal>
  );
};

export default ReleaseFormModal;
