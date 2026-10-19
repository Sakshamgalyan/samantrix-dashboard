"use client";

import React from "react";
import { Modal, Button, Input, Banner } from "@galyan/ui";
import { ShieldAlert, Lock, Eye, EyeOff } from "lucide-react";
import { DISABLE_FORM_ID } from "@/features/security/common/constants";

export interface TwoFactorDisableModalProps {
  isOpen: boolean;
  disablePassword: string;
  disableLoading: boolean;
  showDisablePassword: boolean;
  error: string | null;
  onClose: () => void;
  onPasswordChange: (val: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TwoFactorDisableModal = ({
  isOpen,
  disablePassword,
  disableLoading,
  showDisablePassword,
  error,
  onClose,
  onPasswordChange,
  onToggleShowPassword,
  onSubmit,
}: TwoFactorDisableModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      icon={<ShieldAlert className="size-4" />}
      title="Confirm disabling 2FA"
      subtitle="Enter your account password to confirm removal of two-factor authentication."
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
          <Button variant="secondary" size="sm" onClick={onClose} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button
            type="submit"
            form={DISABLE_FORM_ID}
            variant="danger"
            size="sm"
            disabled={disableLoading || !disablePassword}
            isLoading={disableLoading}
            loadingText="Disabling..."
            className="flex-1 sm:flex-initial"
          >
            Disable 2FA
          </Button>
        </div>
      }
    >
      <form id={DISABLE_FORM_ID} onSubmit={onSubmit} className="space-y-4">
        {error && <Banner variant="danger" size="sm" description={error} />}
        <Input
          type={showDisablePassword ? "text" : "password"}
          fullWidth
          size="sm"
          value={disablePassword}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Enter current password"
          aria-label="Current password"
          required
          autoFocus
          leftIcon={<Lock className="size-4" />}
          rightIcon={showDisablePassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          onRightIconClick={onToggleShowPassword}
        />
      </form>
    </Modal>
  );
};
