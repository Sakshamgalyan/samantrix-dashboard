"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Banner, Button, Modal, Typography } from "@galyan/ui";

export interface DeleteModalProps {
  /** Controls visibility of the modal */
  isOpen: boolean;
  /** Callback invoked when the user cancels or closes the modal */
  onClose: () => void;
  /** Callback invoked when the user confirms the deletion */
  onConfirm: () => void | Promise<void>;
  /** Main modal header title (defaults to "Confirm Deletion") */
  title?: React.ReactNode;
  /** Secondary subtitle shown in the modal header */
  subtitle?: React.ReactNode;
  /** Name of the specific item being deleted (e.g. key name, repo URL, email) */
  itemName?: string;
  /** Semantic type of the entity being deleted (e.g. "API key", "repository", "member") */
  itemType?: string;
  /** Custom body description override */
  description?: React.ReactNode;
  /** Optional critical warning callout rendered inside a danger Banner */
  warningMessage?: React.ReactNode;
  /** Label for the confirm button (defaults to "Delete") */
  confirmText?: string;
  /** Label for the cancel button (defaults to "Cancel") */
  cancelText?: string;
  /** Indicates that the delete request is in progress */
  isDeleting?: boolean;
  /** Text shown while deleting (defaults to "Deleting...") */
  loadingText?: string;
  /** Confirm button danger styling variant */
  dangerVariant?: "danger" | "danger-soft";
  /** Custom icon shown in modal header (defaults to Trash2 in danger color) */
  icon?: React.ReactNode;
  /** Additional custom children rendered in the modal body */
  children?: React.ReactNode;
}

/**
 * CommonDeleteModal
 *
 * Reusable deletion confirmation modal adhering to @galyan/ui design standards.
 * Enforces explicit user confirmation before executing irreversible delete operations.
 */
export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  itemName,
  itemType = "item",
  description,
  warningMessage,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDeleting = false,
  loadingText = "Deleting...",
  dangerVariant = "danger",
  icon,
  children,
}: DeleteModalProps) {
  const modalTitle =
    title || (itemName ? `Delete ${itemType}` : "Confirm Deletion");

  const modalIcon = icon || (
    <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--gy-danger-soft,#fee2e2)] text-[var(--gy-danger,#ef4444)]">
      <Trash2 className="size-4 shrink-0" />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      icon={modalIcon}
      title={modalTitle}
      subtitle={subtitle}
      closable={!isDeleting}
      preventBackdropClose={isDeleting}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={isDeleting}
          >
            {cancelText}
          </Button>
          <Button
            variant={dangerVariant}
            size="sm"
            type="button"
            isLoading={isDeleting}
            loadingText={loadingText}
            leftIcon={<Trash2 className="size-3.5" />}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 py-1">
        {description ? (
          typeof description === "string" ? (
            <Typography variant="small" textColor="var(--gy-text-secondary)">
              {description}
            </Typography>
          ) : (
            description
          )
        ) : (
          <Typography variant="small" textColor="var(--gy-text-secondary)">
            Are you sure you want to {confirmText.toLowerCase()}{" "}
            {itemName ? (
              <Typography
                variant="small"
                as="span"
                weight="semibold"
                textColor="var(--gy-text)"
                className="font-mono rounded bg-[var(--gy-surface-hover)] px-1.5 py-0.5"
              >
                {itemName}
              </Typography>
            ) : (
              `this ${itemType}`
            )}
            ? This action cannot be undone.
          </Typography>
        )}

        {warningMessage && (
          <Banner
            variant="danger"
            size="sm"
            bannerStyle="subtle"
            title="Warning"
            description={
              typeof warningMessage === "string" ? warningMessage : undefined
            }
          >
            {typeof warningMessage !== "string" ? warningMessage : null}
          </Banner>
        )}

        {children}
      </div>
    </Modal>
  );
}

export default DeleteModal;
