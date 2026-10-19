"use client";

import { Button, Modal, Textarea } from "@galyan/ui";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { useOrganizationsContext } from "@/features/organizations/context";
import { STATUS_META } from "@/features/organizations/common/constants";

/** Confirmation for suspending or re-activating an organization. */
export const StatusChangeModal = () => {
  const { state, setStatusReason, closeStatusDialog, submitStatusChange } =
    useOrganizationsContext();
  const dialog = state.statusDialog;
  const suspending = dialog?.target === "SUSPENDED";

  return (
    <Modal
      isOpen={dialog !== null}
      onClose={closeStatusDialog}
      size="sm"
      title={
        dialog
          ? suspending
            ? `Suspend ${dialog.org.name}?`
            : `Activate ${dialog.org.name}?`
          : undefined
      }
      subtitle={dialog ? `Owner: ${dialog.org.owner.email}` : undefined}
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={closeStatusDialog}
            disabled={dialog?.submitting}
          >
            Cancel
          </Button>
          <Button
            variant={suspending ? "danger" : "primary"}
            size="sm"
            className="w-full sm:w-auto"
            isLoading={dialog?.submitting}
            onClick={() => void submitStatusChange()}
          >
            {suspending ? "Suspend organization" : "Activate organization"}
          </Button>
        </div>
      }
    >
      {dialog && (
        <div className="space-y-3">
          <div
            className={`${GLASS_ROW} px-3 py-2.5 text-sm text-[var(--gy-text-secondary)]`}
          >
            Status changes from{" "}
            <strong className="text-[var(--gy-text)]">
              {STATUS_META[dialog.org.status]?.label ?? dialog.org.status}
            </strong>{" "}
            to{" "}
            <strong className="text-[var(--gy-text)]">
              {suspending ? "Suspended" : "Active"}
            </strong>
            . {dialog.org.memberCount} member
            {dialog.org.memberCount === 1 ? "" : "s"} belong to this
            organization. The change is recorded in the organization&apos;s
            audit log.
          </div>
          <Textarea
            label="Reason (optional)"
            placeholder={
              suspending
                ? "e.g. Payment overdue, abuse report…"
                : "e.g. Payment received"
            }
            value={dialog.reason}
            onChange={(e) => setStatusReason(e.target.value)}
            maxCharCount={500}
            maxLength={500}
            rows={3}
            fullWidth
            size="sm"
          />
        </div>
      )}
    </Modal>
  );
}
