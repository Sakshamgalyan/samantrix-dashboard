"use client";

import { Button, Dropdown, Modal } from "@galyan/ui";
import { GLASS_ROW } from "@/components/admin";
import { useDevelopersContext } from "../context";
import { ROLE_DIALOGS } from "../common/constants";
import type { DeveloperDialogKind } from "../types";

const COPY: Record<
  DeveloperDialogKind,
  { title: (name: string) => string; confirm: string; danger: boolean }
> = {
  approve: { title: (n) => `Approve ${n}`, confirm: "Approve", danger: false },
  reinstate: {
    title: (n) => `Reinstate ${n}`,
    confirm: "Reinstate",
    danger: false,
  },
  role: {
    title: (n) => `Change role for ${n}`,
    confirm: "Save role",
    danger: false,
  },
  reject: {
    title: (n) => `Reject ${n}?`,
    confirm: "Reject request",
    danger: true,
  },
  revoke: {
    title: (n) => `Revoke ${n}'s access?`,
    confirm: "Revoke access",
    danger: true,
  },
};

/** Approve / change role / reinstate (with a role picker) and reject / revoke (confirm). */
export function DecisionDialog() {
  const { state, roleOptions, closeDialog, setRole, submitDialog } =
    useDevelopersContext();
  const { dialog, selectedRole, submitting } = state;
  const copy = dialog ? COPY[dialog.kind] : null;

  return (
    <Modal
      variant="glass"
      isOpen={dialog !== null}
      onClose={closeDialog}
      size="sm"
      title={dialog && copy ? copy.title(dialog.dev.fullName) : undefined}
      subtitle={dialog?.dev.email}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeDialog}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant={copy?.danger ? "danger" : "primary"}
            size="sm"
            isLoading={submitting}
            onClick={submitDialog}
          >
            {copy?.confirm}
          </Button>
        </div>
      }
    >
      {dialog && ROLE_DIALOGS.has(dialog.kind) ? (
        <div className="space-y-3">
          <Dropdown
            label="Platform role"
            variant="glass"
            options={roleOptions}
            value={selectedRole}
            onChange={(v) => setRole(v as string)}
          />
          <div
            className={`${GLASS_ROW} px-3 py-2.5 text-xs text-[var(--gy-text-secondary)]`}
          >
            {dialog.kind === "role"
              ? "The new role applies on their next request."
              : "They'll get an email saying their access is approved and can sign in right away."}
          </div>
        </div>
      ) : dialog ? (
        <div
          className={`${GLASS_ROW} px-3 py-2.5 text-sm text-[var(--gy-text-secondary)]`}
        >
          {dialog.kind === "revoke"
            ? "They'll be signed out on every device and can't sign in again until reinstated. They'll be told by email."
            : "Their request will be declined and they'll be told by email. You can reinstate them later."}
        </div>
      ) : null}
    </Modal>
  );
}
