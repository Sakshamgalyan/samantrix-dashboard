"use client";

import React from "react";
import { Modal, Button, Banner, Chip, Dropdown, Typography } from "@galyan/ui";
import { SlidersHorizontal, PlayCircle, Ban } from "lucide-react";
import type { OrgRole } from "@/types/dashboard";
import { ROLE_OPTIONS } from "@/features/users/types/api";
import { useUsersContext } from "@/features/users/context";

export function MemberSettingsModal() {
  const {
    state,
    closeSettingsDialog,
    setSettingsRole,
    setSettingsStatus,
    saveSettings,
    dismissSettingsError,
  } = useUsersContext();

  const { settingsDialog } = state;
  const { member, role, status, isSaving, error } = settingsDialog;

  if (!member) return null;

  return (
    <Modal
      isOpen={member !== null}
      onClose={closeSettingsDialog}
      onCancel={closeSettingsDialog}
      size="md"
      icon={<SlidersHorizontal className="size-4" />}
      title="Member Settings"
      footer={
        <div className="flex flex-col-reverse sm:flex-row w-full items-stretch sm:items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={closeSettingsDialog}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={saveSettings}
            isLoading={isSaving}
            loadingText="Saving..."
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Save changes
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {error && (
          <Banner
            variant="danger"
            title="Failed to update settings"
            description={error}
            dismissible
            onDismiss={dismissSettingsError}
          />
        )}

        {/* Member Profile Snapshot */}
        <div className="flex items-center gap-3.5 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-subtle)] p-3 sm:p-3.5">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--gy-primary)] text-sm font-bold text-[var(--gy-primary-fg)]">
            {(member.fullName || "User").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="truncate text-sm">
                {member.fullName || "Unnamed User"}
              </Typography>
              <Chip
                variant={member.status === "ACTIVE" ? "success" : "danger"}
                size="xs"
              >
                {member.status}
              </Chip>
            </div>
            <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs block">
              {member.email}
            </Typography>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {member.department && (
                <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
                  Dept: {member.department}
                </Typography>
              )}
              <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
                Joined{" "}
                {new Date(member.joinedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
            </div>
          </div>
        </div>

        {/* Status Setting */}
        <div className="space-y-2">
          <Typography variant="label" weight="semibold" textColor="var(--gy-text-secondary)" className="text-xs tracking-wider uppercase block">
            Account Status
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSettingsStatus("ACTIVE")}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                status === "ACTIVE"
                  ? "border-[var(--gy-success)] bg-[var(--gy-success-soft,#ecfdf5)] ring-2 ring-[var(--gy-success)]"
                  : "border-[var(--gy-border)] bg-[var(--gy-surface)] hover:border-[var(--gy-border-strong)]"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm">
                  Active
                </Typography>
                <PlayCircle
                  className={`size-4 ${
                    status === "ACTIVE"
                      ? "text-[var(--gy-success)]"
                      : "text-[var(--gy-text-subtle)]"
                  }`}
                />
              </div>
              <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
                Normal access granted to workplace, chat, and voice
              </Typography>
            </button>

            <button
              type="button"
              onClick={() => setSettingsStatus("SUSPENDED")}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                status === "SUSPENDED"
                  ? "border-[var(--gy-danger)] bg-[var(--gy-danger-soft,#fef2f2)] ring-2 ring-[var(--gy-danger)]"
                  : "border-[var(--gy-border)] bg-[var(--gy-surface)] hover:border-[var(--gy-border-strong)]"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm">
                  Suspended
                </Typography>
                <Ban
                  className={`size-4 ${
                    status === "SUSPENDED"
                      ? "text-[var(--gy-danger)]"
                      : "text-[var(--gy-text-subtle)]"
                  }`}
                />
              </div>
              <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
                Temporarily revoke workplace login &amp; credentials
              </Typography>
            </button>
          </div>
        </div>

        {/* Role Setting */}
        <div className="space-y-2">
          <Typography variant="label" weight="semibold" textColor="var(--gy-text-secondary)" className="text-xs tracking-wider uppercase block">
            Workspace Role
          </Typography>
          <Dropdown
            options={ROLE_OPTIONS}
            value={role}
            onChange={(val) => setSettingsRole(val as OrgRole)}
          />
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs block">
            {role === "ADMIN" &&
              "Admin: Full organization and team management privileges."}
            {role === "MANAGER" &&
              "Manager: Team oversight, releases, and invitation rights."}
            {role === "MEMBER" &&
              "Member: Standard digital workplace access with presence and voice."}
            {role === "VIEWER" &&
              "Viewer: Read-only access to workplace feeds and boards."}
          </Typography>
        </div>
      </div>
    </Modal>
  );
}
