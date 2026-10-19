"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { Card, Button, Typography, Chip, Spinner } from "@galyan/ui";
import { SimantrixMark } from "@/components/brand/simantrix-logo";
import {
  isBackendDownError,
  checkBackendHealth,
  setCachedBackendOfflineState,
  clearCachedBackendOfflineState,
} from "@/lib/api-client/apiClient";
import {
  ServerOff,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export interface ServerErrorViewProps {
  /** Error object or string describing what went wrong. */
  error?: (Error & { digest?: string }) | unknown;
  /** Explicit display mode, or "auto" to detect based on error characteristics. */
  mode?: "auto" | "backend-offline" | "runtime-error";
  /** Callback to re-attempt the failed operation or reload session. */
  onRetry?: () => void | Promise<void | boolean>;
  /** Whether to render as a full-viewport splash (true) or embedded inside a section/shell (false). */
  fullScreen?: boolean;
  /** Optional custom title override. */
  title?: string;
  /** Optional custom description override. */
  description?: string;
}

export const ServerErrorView = ({
  error,
  mode = "auto",
  onRetry,
  fullScreen = true,
  title,
  description,
}: ServerErrorViewProps) => {
  const [isPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Automatically determine if the error is due to backend failure vs code crash
  const effectiveMode =
    mode === "auto"
      ? isBackendDownError(error)
        ? "backend-offline"
        : "runtime-error"
      : mode;

  const isOffline = effectiveMode === "backend-offline";

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : null;

  const defaultTitle = "Server Error";

  const defaultDescription = isOffline
    ? "Unable to connect to the server. Please try again."
    : (errorMessage && errorMessage.length < 160)
      ? errorMessage
      : "An unexpected error occurred. Please try again.";

  // Cache offline state when detected
  useEffect(() => {
    if (isOffline) {
      setCachedBackendOfflineState({
        message: description || defaultDescription,
        statusCode: 503,
      });
    }
  }, [isOffline, description, defaultDescription]);

  // Check health of central backend
  const handleCheckHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkBackendHealth();
      if (result.isOnline) {
        clearCachedBackendOfflineState();
        setCheckResult({
          success: true,
          message: "Connected! Reloading...",
        });
        if (onRetry) {
          startTransition(() => {
            void Promise.resolve(onRetry());
          });
        } else {
          window.location.reload();
        }
      } else {
        setCheckResult({
          success: false,
          message: "Server is unreachable. Please try again.",
        });
      }
    } catch {
      setCheckResult({
        success: false,
        message: "Connection failed. Please try again.",
      });
    } finally {
      setIsChecking(false);
    }
  }, [onRetry]);

  // Manual retry handler
  const handleManualRetry = useCallback(() => {
    if (isOffline) {
      void handleCheckHealth();
      return;
    }

    if (onRetry) {
      setIsChecking(true);
      startTransition(() => {
        try {
          const res = onRetry();
          if (res instanceof Promise) {
            res.finally(() => setIsChecking(false));
          } else {
            setIsChecking(false);
          }
        } catch {
          setIsChecking(false);
        }
      });
    } else {
      window.location.reload();
    }
  }, [isOffline, handleCheckHealth, onRetry]);

  const cardContent = (
    <Card
      variant="glass"
      radius="xl"
      padding="lg"
      className="relative max-w-md w-full border border-[var(--gy-border)] bg-[var(--gy-surface)]/90 backdrop-blur-2xl shadow-2xl overflow-hidden text-center select-none"
    >
      {/* Top ambient color accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isOffline
            ? "bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500"
            : "bg-gradient-to-r from-rose-500 via-[var(--gy-primary)] to-rose-500"
        }`}
      />

      <div className="flex flex-col items-center">
        {/* Brand logo with error badge */}
        <div className="relative mb-4 flex justify-center">
          <div className="relative p-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent shadow-xl">
            <SimantrixMark
              size={54}
              className="rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            />
          </div>
          <span
            className={`absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full text-white shadow-md ${
              isOffline ? "bg-amber-500" : "bg-rose-500"
            }`}
          >
            {isOffline ? (
              <ServerOff className="size-3" />
            ) : (
              <AlertTriangle className="size-3" />
            )}
          </span>
        </div>

        {/* Severity badge */}
        <div className="mb-2">
          <Chip
            variant={isOffline ? "warning" : "danger"}
            size="xs"
            icon={
              isOffline ? (
                <ServerOff className="size-3" />
              ) : (
                <AlertTriangle className="size-3" />
              )
            }
            className="uppercase tracking-wider font-semibold text-[10px]"
          >
            Server Error
          </Chip>
        </div>

        {/* Headline */}
        <Typography
          variant="h3"
          weight="bold"
          textColor="var(--gy-text)"
          className="tracking-tight text-lg sm:text-xl"
        >
          {title || defaultTitle}
        </Typography>

        {/* Description / friendly message */}
        <Typography
          variant="small"
          textColor="var(--gy-text-secondary)"
          className="mt-2 text-xs leading-relaxed max-w-sm"
        >
          {description || defaultDescription}
        </Typography>

        {/* Only the retry option is present */}
        <div className="mt-6 w-full space-y-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            leftIcon={
              isChecking || isPending ? (
                <Spinner size="xs" color="white" />
              ) : (
                <RefreshCw className="size-4" />
              )
            }
            onClick={handleManualRetry}
            disabled={isChecking || isPending}
            className="w-full text-xs font-semibold shadow-lg shadow-[var(--gy-primary)]/20"
          >
            {isChecking
              ? "Retrying..."
              : isOffline
                ? "Retry Connection"
                : "Try Again"}
          </Button>

          {isOffline && checkResult && (
            <div
              className={`flex items-center justify-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                checkResult.success
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {checkResult.success ? (
                <CheckCircle2 className="size-3.5 shrink-0" />
              ) : (
                <ServerOff className="size-3.5 shrink-0" />
              )}
              <Typography
                variant="span"
                className="text-[11px] leading-tight font-medium"
              >
                {checkResult.message}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (!fullScreen) {
    return (
      <div className="w-full flex items-center justify-center py-8 px-2 sm:px-4">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-dvh w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[var(--gy-background)] select-none">
      {/* Ambient decorative lighting */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute top-1/4 -left-20 size-96 rounded-full bg-rose-500/12 blur-[130px]" />
        <div className="absolute bottom-1/4 -right-20 size-96 rounded-full bg-[var(--gy-primary)]/15 blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {cardContent}
      </div>
    </div>
  );
}

export default ServerErrorView;
