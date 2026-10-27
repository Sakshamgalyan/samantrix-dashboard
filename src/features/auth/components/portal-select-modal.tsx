"use client";

import { useState } from "react";
import { Banner, Button, Modal, Spinner, Typography } from "@galyan/ui";
import { Building2, ChevronRight, Code2 } from "lucide-react";
import type { LoginPortal } from "@/features/auth/context/auth-context";

interface PortalSelectModalProps {
  isOpen: boolean;
  organizationName: string | null;
  submitting: LoginPortal | null;
  error: string | null;
  onSelect: (portal: LoginPortal) => void;
  /** Backs out of the sign-in (ends the session that was just opened). */
  onCancel: () => void | Promise<void>;
}

interface PortalOption {
  id: LoginPortal;
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

/**
 * Shown to developer accounts right after authentication: pick the console this
 * session opens in. The choice is stored on the login session.
 */
export const PortalSelectModal = ({
  isOpen,
  organizationName,
  submitting,
  error,
  onSelect,
  onCancel,
}: PortalSelectModalProps) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (isCancelling || submitting !== null) return;
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
    }
  };

  const options: PortalOption[] = [
    {
      id: "DEVELOPER",
      title: "Sign in as developer",
      description:
        "Platform console: organizations, leads, feature flags, releases and audit logs.",
      icon: <Code2 className="size-5" />,
    },
    {
      id: "ORGANIZATION",
      title: "Sign in as organization",
      description: organizationName
        ? `Workspace console for ${organizationName}.`
        : "No organization is linked to this account.",
      icon: <Building2 className="size-5" />,
      disabled: !organizationName,
    },
  ];

  const isBusy = submitting !== null || isCancelling;

  return (
    <Modal
      isOpen={isOpen}
      size="md"
      variant="glass"
      title="How do you want to sign in?"
      subtitle="Your account has developer access. Choose the console for this session."
      showCloseButton={false}
      closable={false}
      preventBackdropClose
      footer={
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            isLoading={isCancelling}
            loadingText="Signing out..."
            disabled={isBusy}
          >
            Cancel and sign out
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error && (
          <Banner
            variant="danger"
            size="sm"
            bannerStyle="subtle"
            description={error}
          />
        )}

        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={option.disabled || isBusy}
            onClick={() => onSelect(option.id)}
            className="group flex w-full items-center gap-4 rounded-xl border border-[var(--gy-border)] bg-[color-mix(in_srgb,var(--gy-surface)_55%,transparent)] p-4 text-left transition-colors hover:border-[var(--gy-primary)] hover:bg-[var(--gy-primary)]/5 focus-visible:outline-2 focus-visible:outline-[var(--gy-primary)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--gy-border)] disabled:hover:bg-[color-mix(in_srgb,var(--gy-surface)_55%,transparent)]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
              {option.icon}
            </span>
            <span className="min-w-0 flex-1 space-y-0.5">
              <Typography
                variant="span"
                weight="semibold"
                className="block text-sm text-[var(--gy-text)]"
              >
                {option.title}
              </Typography>
              <Typography
                variant="span"
                className="block text-xs text-[var(--gy-text-secondary)]"
              >
                {option.description}
              </Typography>
            </span>
            {submitting === option.id ? (
              <Spinner size="sm" color="primary" />
            ) : (
              <ChevronRight className="size-4 shrink-0 text-[var(--gy-text-subtle)] transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
};
