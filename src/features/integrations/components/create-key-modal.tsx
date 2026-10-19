"use client";

import React from "react";
import { Banner, Button, Input, Modal, Typography } from "@galyan/ui";
import { Copy, Check, KeyRound } from "lucide-react";
import { CREATE_FORM_ID } from "@/features/integrations/common/constants";

export interface CreateKeyModalProps {
  isOpen: boolean;
  keyName: string;
  creating: boolean;
  newKeySecret: string | null;
  copiedKey: boolean;
  error?: string | null;
  onClose: () => void;
  onKeyNameChange: (name: string) => void;
  onCreate: (e: React.FormEvent) => void;
  onCopyKey: () => void;
  onDismissError?: () => void;
}

export function CreateKeyModal({
  isOpen,
  keyName,
  creating,
  newKeySecret,
  copiedKey,
  error,
  onClose,
  onKeyNameChange,
  onCreate,
  onCopyKey,
  onDismissError,
}: CreateKeyModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim() || creating) return;
    onCreate(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon={<KeyRound className="size-4 text-[var(--gy-primary)]" />}
      title={newKeySecret ? "API Key Created" : "Create API Key"}
      subtitle={
        newKeySecret
          ? "Store this secret key safely"
          : "Generate a cryptographically secured API key to authenticate integrations"
      }
      footer={
        newKeySecret ? (
          <div className="flex w-full items-center justify-end">
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={CREATE_FORM_ID}
              variant="primary"
              size="sm"
              isLoading={creating}
              loadingText="Generating..."
              disabled={!keyName.trim() || creating}
              onClick={(e) => {
                if (keyName.trim() && !creating) {
                  handleSubmit(e);
                }
              }}
            >
              Generate Key
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-4 py-1">
        {error && (
          <Banner
            variant="danger"
            size="sm"
            title="Failed to generate API key"
            description={error}
            dismissible={Boolean(onDismissError)}
            onDismiss={onDismissError}
          />
        )}

        {newKeySecret ? (
          <div className="space-y-3">
            <Banner
              variant="success"
              size="sm"
              description="Copy your secret key now. For security reasons, you will never be able to view it again."
            />
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--gy-text-secondary)]">
                Secret API Key
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken,#f8fafc)] p-3">
                <code className="flex-1 select-all break-all font-mono text-xs text-[var(--gy-primary)]">
                  {newKeySecret}
                </code>
                <Button
                  variant="secondary"
                  size="xs"
                  type="button"
                  leftIcon={
                    copiedKey ? (
                      <Check className="size-3.5 text-[var(--gy-success)]" />
                    ) : (
                      <Copy className="size-3.5" />
                    )
                  }
                  onClick={onCopyKey}
                >
                  {copiedKey ? "Copied" : "Copy"}
                </Button>
              </div>
              <Typography variant="small" className="text-xs text-[var(--gy-text-subtle)]">
                Store this key securely in your backend environment variables or key vault.
              </Typography>
            </div>
          </div>
        ) : (
          <form id={CREATE_FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="create-api-key-name-input"
              name="keyName"
              label="Key Name"
              placeholder="e.g. Production Backend Relay, Zapier Webhook"
              value={keyName}
              onChange={(e) => onKeyNameChange(e.target.value)}
              leftIcon={<KeyRound className="size-4" />}
              required
              autoFocus
              autoComplete="off"
              helperText="Give your key a descriptive name to track its purpose in audit logs."
            />
          </form>
        )}
      </div>
    </Modal>
  );
}
