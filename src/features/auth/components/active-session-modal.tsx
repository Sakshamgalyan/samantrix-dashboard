"use client";

import { useState } from "react";
import { Banner, Button, Modal, Typography } from "@galyan/ui";
import { Laptop, MonitorSmartphone, Trash2 } from "lucide-react";
import { useAuthPageContext } from "@/features/auth/context";

function formatWhen(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

/**
 * The account is signed in on another device. Lists that session with a delete
 * (sign out) action; once it is gone the sign-in is retried automatically.
 */
export const ActiveSessionModal = () => {
  const {
    sessionConflict,
    handleRevokeBlockingSession,
    dismissSessionConflict,
  } = useAuthPageContext();

  const [isDismissing, setIsDismissing] = useState(false);

  const busy = Boolean(sessionConflict?.revokingId) || isDismissing;

  const handleDismiss = async () => {
    if (busy) return;
    setIsDismissing(true);
    try {
      await dismissSessionConflict();
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <Modal
      isOpen={sessionConflict !== null}
      onClose={busy ? undefined : handleDismiss}
      size="md"
      icon={<MonitorSmartphone className="size-4" />}
      title="Signed in on another device"
      subtitle="Your account can be signed in on one device at a time. Sign out of the other device to continue here."
      preventBackdropClose={busy}
      footer={
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={handleDismiss}
            isLoading={isDismissing}
            loadingText="Cancelling..."
            disabled={busy}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {sessionConflict?.error && (
          <Banner
            variant="danger"
            size="sm"
            bannerStyle="subtle"
            description={sessionConflict.error}
          />
        )}

        {sessionConflict?.sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--gy-border)] bg-[color-mix(in_srgb,var(--gy-surface)_55%,transparent)] p-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
              <Laptop className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <Typography
                variant="span"
                weight="semibold"
                className="block truncate text-sm text-[var(--gy-text)]"
              >
                {session.deviceName || "Unknown device"}
              </Typography>
              <Typography
                variant="span"
                className="block truncate text-xs text-[var(--gy-text-secondary)]"
              >
                Signed in {formatWhen(session.loginAt)}
                {session.ipAddress ? ` · ${session.ipAddress}` : ""}
              </Typography>
              <Typography
                variant="span"
                className="block text-xs text-[var(--gy-text-subtle)]"
              >
                Last active {formatWhen(session.lastSeenAt)}
              </Typography>
            </div>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="size-3.5" />}
              isLoading={sessionConflict.revokingId === session.id}
              loadingText="Signing out..."
              disabled={busy}
              onClick={() => handleRevokeBlockingSession(session.id)}
            >
              Sign out
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
};
