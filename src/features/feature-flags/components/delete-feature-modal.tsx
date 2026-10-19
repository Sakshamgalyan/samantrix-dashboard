"use client";

import React from "react";
import { Button, Modal } from "@galyan/ui";
import { Trash2 } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { useFeatureFlagsContext } from "@/features/feature-flags/context";

export const DeleteFeatureModal = () => {
  const { dialog, submitting, closeDialog, deleteFeature } =
    useFeatureFlagsContext();
  const feature = dialog?.kind === "delete" ? dialog.feature : null;
  const stored = feature ? feature.enabled + feature.disabled : 0;

  return (
    <Modal
      size="sm"
      isOpen={feature !== null}
      onClose={closeDialog}
      icon={<Trash2 className="size-5" />}
      title={feature ? `Delete ${feature.name}?` : undefined}
      subtitle={feature?.featureKey}
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
            variant="danger"
            size="sm"
            isLoading={submitting}
            onClick={deleteFeature}
          >
            Delete feature
          </Button>
        </div>
      }
    >
      {feature && (
        <div
          className={`${GLASS_ROW} space-y-2 px-3 py-2.5 text-sm text-[var(--gy-text-secondary)]`}
        >
          <p>
            The feature is removed from the catalog together with every
            organization&apos;s setting and plan entitlement for it, in one
            step. This can&apos;t be undone.
          </p>
          <p className="font-medium text-[var(--gy-text)]">
            {stored === 0
              ? "No organization has a stored setting for it."
              : `${stored} organization setting${stored === 1 ? "" : "s"} will be cleared (${feature.enabled} currently on).`}
          </p>
        </div>
      )}
    </Modal>
  );
};
