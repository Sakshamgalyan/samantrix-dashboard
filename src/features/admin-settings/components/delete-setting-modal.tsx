"use client";

import { Button, Modal, Typography } from "@galyan/ui";
import { RotateCcw, Trash2 } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { useSettingsContext } from "@/features/admin-settings/context";
import { formatValue } from "@/features/admin-settings/common/constants";

/** Confirms deleting a custom setting, or resetting a built-in one to its default. */
export const DeleteSettingModal = () => {
  const { state, closeDelete, confirmDelete } = useSettingsContext();
  const target = state.deleteTarget;
  const reset = target?.isBuiltIn ?? false;

  return (
    <Modal
      isOpen={target !== null}
      onClose={() => !state.deleting && closeDelete()}
      size="sm"
      icon={
        reset ? (
          <RotateCcw className="size-5" />
        ) : (
          <Trash2 className="size-5" />
        )
      }
      title={reset ? "Reset to default?" : "Delete this setting?"}
      subtitle={target?.key}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeDelete}
            disabled={state.deleting}
          >
            Cancel
          </Button>
          <Button
            variant={reset ? "primary" : "danger"}
            size="sm"
            isLoading={state.deleting}
            onClick={() => void confirmDelete()}
          >
            {reset ? "Reset" : "Delete"}
          </Button>
        </div>
      }
    >
      {target && (
        <Typography
          variant="p"
          className={`${GLASS_ROW} px-3 py-2.5 text-sm text-[var(--gy-text-secondary)]`}
        >
          {reset
            ? `The stored value is removed and ${target.label} goes back to its default (${formatValue(target, target.defaultValue)}).`
            : target.isSecret
              ? "The secret value is permanently removed. Anything still reading this key will stop finding it."
              : "The setting and its value are permanently removed. Anything still reading this key will stop finding it."}
        </Typography>
      )}
    </Modal>
  );
};
