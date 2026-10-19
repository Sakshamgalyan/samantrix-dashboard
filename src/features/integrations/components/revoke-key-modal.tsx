"use client";

import React from "react";
import { DeleteModal } from "@/components/common/delete-modal";
import type { OrgApiKeyRow } from "@/features/integrations/types/api";

export interface RevokeKeyModalProps {
  target: OrgApiKeyRow | null;
  revoking: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RevokeKeyModal({
  target,
  revoking,
  onClose,
  onConfirm,
}: RevokeKeyModalProps) {
  return (
    <DeleteModal
      isOpen={Boolean(target)}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Revoke API Key"
      itemName={target?.name}
      itemType="API key"
      confirmText="Revoke Key"
      isDeleting={revoking}
      loadingText="Revoking..."
      warningMessage="Any background workflows, CI/CD pipelines, or external systems using this key will immediately receive 401 Unauthorized errors and lose access."
    />
  );
}
