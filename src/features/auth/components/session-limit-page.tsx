"use client";

import { useState } from "react";
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Typography,
} from "@galyan/ui";
import { ArrowLeft, Laptop, MonitorSmartphone, LogOut } from "lucide-react";
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
 * Shown instead of the sign-in form when the account is already signed in on as many
 * devices as it is allowed. Signing out any one of them frees a slot, and the sign-in
 * is then retried automatically.
 */
export const SessionLimitPage = () => {
  const {
    sessionConflict,
    handleRevokeBlockingSession,
    dismissSessionConflict,
  } = useAuthPageContext();

  const [isDismissing, setIsDismissing] = useState(false);

  if (!sessionConflict) return null;

  const busy = Boolean(sessionConflict.revokingId) || isDismissing;

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
    <Card
      variant="glass"
      padding="md"
      radius="xl"
      shadow="lg"
      className="w-full max-w-[640px]"
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--gy-warning)]/15 text-[var(--gy-warning)]">
            <MonitorSmartphone className="size-5" />
          </span>
          <div className="min-w-0">
            <Typography
              variant="h3"
              weight="semibold"
              className="text-[var(--gy-text)]"
            >
              Device limit reached
            </Typography>
            <Typography
              variant="p"
              className="text-sm text-[var(--gy-text-secondary)]"
            >
              Your account is already signed in on another device. Sign out of
              an active session to continue here.
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {sessionConflict.error && (
            <Banner
              variant="danger"
              size="sm"
              bannerStyle="subtle"
              description={sessionConflict.error}
            />
          )}
          {sessionConflict.sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gy-border)] bg-[color-mix(in_srgb,var(--gy-surface)_55%,transparent)] p-3"
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
                leftIcon={<LogOut className="size-3.5" />}
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
      </CardBody>
      <CardFooter>
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft className="size-4" />}
          onClick={handleDismiss}
          isLoading={isDismissing}
          loadingText="Returning..."
          disabled={busy}
        >
          Back to sign in
        </Button>
      </CardFooter>
    </Card>
  );
};
