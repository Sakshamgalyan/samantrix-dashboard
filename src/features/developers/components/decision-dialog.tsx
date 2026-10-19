"use client";

import { Button, Dropdown, Input, Modal } from "@galyan/ui";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { useDevelopersContext } from "@/features/developers/context";
import { ROLE_DIALOGS } from "@/features/developers/common/constants";
import type { DeveloperDialogKind } from "@/features/developers/types";

const COPY: Record<
  DeveloperDialogKind,
  {
    title: (name: string) => string;
    confirm: string;
    danger: boolean;
    note: string;
  }
> = {
  approve: {
    title: (n) => `Approve ${n}`,
    confirm: "Approve",
    danger: false,
    note: "They're emailed that access is approved and can sign in right away.",
  },
  reinstate: {
    title: (n) => `Reinstate ${n}`,
    confirm: "Reinstate",
    danger: false,
    note: "They're emailed and can sign in again with this role.",
  },
  role: {
    title: (n) => `Change role for ${n}`,
    confirm: "Save role",
    danger: false,
    note: "They're signed out on every device and get the new role when they sign in again.",
  },
  edit: {
    title: (n) => `Edit ${n}`,
    confirm: "Save changes",
    danger: false,
    note: "Changing the role or suspending signs them out on every device.",
  },
  reject: {
    title: (n) => `Reject ${n}?`,
    confirm: "Reject request",
    danger: true,
    note: "Their request is declined and they're told by email. You can reinstate them later.",
  },
  suspend: {
    title: (n) => `Suspend ${n}?`,
    confirm: "Suspend",
    danger: true,
    note: "They're signed out on every device and can't sign in until reactivated.",
  },
  reactivate: {
    title: (n) => `Reactivate ${n}?`,
    confirm: "Reactivate",
    danger: false,
    note: "They can sign in again with their current role.",
  },
  delete: {
    title: (n) => `Delete ${n}?`,
    confirm: "Delete account",
    danger: true,
    note: "They're signed out everywhere and the account is permanently removed. This can't be undone.",
  },
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
];

/** One modal for every developer action: role pickers, the edit form, and confirmations. */
export function DecisionDialog() {
  const { state, roleOptions, closeDialog, patchForm, submitDialog } =
    useDevelopersContext();
  const { dialog, form, submitting } = state;
  const copy = dialog ? COPY[dialog.kind] : null;

  const note = copy && (
    <div
      className={`${GLASS_ROW} px-3 py-2 text-xs text-[var(--gy-text-secondary)]`}
    >
      {copy.note}
    </div>
  );

  return (
    <Modal
      isOpen={dialog !== null}
      onClose={closeDialog}
      size="md"
      title={dialog && copy ? copy.title(dialog.dev.fullName) : undefined}
      subtitle={dialog?.dev.email}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeDialog}
            disabled={submitting}
            fullWidth
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant={copy?.danger ? "danger" : "primary"}
            size="sm"
            isLoading={submitting}
            onClick={submitDialog}
            fullWidth
            className="sm:w-auto"
          >
            {copy?.confirm}
          </Button>
        </div>
      }
    >
      {dialog?.kind === "edit" ? (
        <div className="space-y-3">
          <Input
            size="sm"
            label="Full name"
            value={form.fullName}
            onChange={(e) => patchForm({ fullName: e.target.value })}
            fullWidth
          />
          <Input
            size="sm"
            label="Phone"
            value={form.phone}
            onChange={(e) => patchForm({ phone: e.target.value })}
            placeholder="+91 98765 43210"
            fullWidth
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Dropdown
              size="sm"
              label="Role"
              options={roleOptions}
              value={form.role}
              onChange={(v) => patchForm({ role: v as string })}
            />
            <Dropdown
              size="sm"
              label="Status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(v) =>
                patchForm({ status: v as "ACTIVE" | "SUSPENDED" })
              }
            />
          </div>
          {note}
        </div>
      ) : dialog && ROLE_DIALOGS.has(dialog.kind) ? (
        <div className="space-y-3">
          <Dropdown
            size="sm"
            label="Role"
            options={roleOptions}
            value={form.role}
            onChange={(v) => patchForm({ role: v as string })}
          />
          {note}
        </div>
      ) : (
        note
      )}
    </Modal>
  );
}
