"use client";

import React from "react";
import { Modal, Typography } from "@galyan/ui";
import { Trash2 } from "lucide-react";
import { useUsersContext } from "@/features/users/context";

export function RemoveMemberModal() {
  const { state, closeRemoveDialog, confirmRemove } = useUsersContext();
  const { removeDialog } = state;

  return (
    <Modal
      isOpen={removeDialog !== null}
      onClose={closeRemoveDialog}
      onCancel={closeRemoveDialog}
      onConfirm={confirmRemove}
      size="sm"
      icon={<Trash2 className="size-4" />}
      title="Remove member"
      confirmText="Remove"
      cancelText="Cancel"
    >
      <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-sm">
        Are you sure you want to remove{" "}
        <Typography variant="span" weight="semibold" textColor="var(--gy-text)">
          {removeDialog?.name}
        </Typography>{" "}
        from this organization?
      </Typography>
    </Modal>
  );
}
