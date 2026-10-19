"use client";

import React from "react";
import { Modal, Button, Input, Banner, Spinner, Typography } from "@galyan/ui";
import { ShieldCheck, Check, Copy } from "lucide-react";
import { SETUP_FORM_ID } from "@/features/security/common/constants";

export interface TwoFactorSetupModalProps {
  isOpen: boolean;
  setupStep: "SETUP" | "BACKUP";
  totpSecret: string | null;
  qrCodeDataUrl: string | null;
  totpCode: string;
  backupCodes: string[];
  totpLoading: boolean;
  copiedSecret: boolean;
  error: string | null;
  onClose: () => void;
  onTotpCodeChange: (code: string) => void;
  onConfirm: (e: React.FormEvent) => void;
  onCopy: (text: string) => void;
}

export const TwoFactorSetupModal = ({
  isOpen,
  setupStep,
  totpSecret,
  qrCodeDataUrl,
  totpCode,
  backupCodes,
  totpLoading,
  copiedSecret,
  error,
  onClose,
  onTotpCodeChange,
  onConfirm,
  onCopy,
}: TwoFactorSetupModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon={<ShieldCheck className="size-4" />}
      title={setupStep === "SETUP" ? "Set up authenticator app" : "Save recovery backup codes"}
      footer={
        setupStep === "SETUP" ? (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
            <Button variant="secondary" size="sm" onClick={onClose} className="flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button
              type="submit"
              form={SETUP_FORM_ID}
              variant="primary"
              size="sm"
              disabled={totpCode.length !== 6 || totpLoading}
              className="flex-1 sm:flex-initial"
            >
              Verify &amp; enable
            </Button>
          </div>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                copiedSecret ? (
                  <Check className="size-4 text-[var(--gy-success)]" />
                ) : (
                  <Copy className="size-4" />
                )
              }
              onClick={() => onCopy(backupCodes.join("\n"))}
              className="flex-1 sm:flex-initial"
            >
              {copiedSecret ? "Copied" : "Copy codes"}
            </Button>
            <Button variant="primary" size="sm" onClick={onClose} className="flex-1 sm:flex-initial">
              Done
            </Button>
          </div>
        )
      }
    >
      {setupStep === "SETUP" ? (
        <form id={SETUP_FORM_ID} onSubmit={onConfirm} className="space-y-5">
          {error && <Banner variant="danger" size="sm" description={error} />}
          {totpLoading && !totpSecret ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--gy-text-secondary)]">
              <Spinner size="sm" color="primary" />
              <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-sm">
                Generating TOTP secret and QR code...
              </Typography>
            </div>
          ) : (
            <div className="grid items-center gap-5 sm:grid-cols-12">
              <div className="flex flex-col items-center rounded-2xl bg-white p-3 sm:col-span-5 shadow-xs border border-[var(--gy-border)]">
                {qrCodeDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCodeDataUrl} alt="Authenticator QR code" className="size-36 object-contain" />
                )}
              </div>

              <div className="space-y-4 sm:col-span-7">
                <Input
                  type="text"
                  label="Manual setup key"
                  readOnly
                  fullWidth
                  size="sm"
                  className="font-mono"
                  value={totpSecret || ""}
                  rightIcon={
                    copiedSecret ? (
                      <Check className="size-4 text-[var(--gy-success)]" />
                    ) : (
                      <Copy className="size-4" />
                    )
                  }
                  onRightIconClick={() => onCopy(totpSecret || "")}
                  helperText="Scan the QR code, or enter this key in your app."
                />
                <Input
                  type="text"
                  label="6-digit verification code"
                  inputMode="numeric"
                  maxLength={6}
                  fullWidth
                  size="sm"
                  className="font-mono tracking-widest"
                  value={totpCode}
                  onChange={(e) => onTotpCodeChange(e.target.value.trim())}
                  placeholder="123456"
                  required
                  autoFocus
                />
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-4">
          <Banner
            variant="warning"
            size="sm"
            description="Save these recovery codes. Each code can be used once to access your account if your device is unavailable."
          />
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3 font-mono text-sm text-[var(--gy-text)]">
            {backupCodes.map((code, idx) => (
              <div key={idx} className="rounded-md bg-[var(--gy-surface)] p-2 text-center tracking-widest border border-[var(--gy-border)]">
                <Typography variant="span" weight="medium" textColor="var(--gy-text)" className="font-mono text-xs sm:text-sm">
                  {code}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
