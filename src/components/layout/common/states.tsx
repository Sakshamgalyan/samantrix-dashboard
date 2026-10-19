"use client";

import type React from "react";
import { Button, Card, EmptyState, Skeleton } from "@galyan/ui";
import { RefreshCw, ServerCog } from "lucide-react";

/** First-load placeholder: hero, KPI tiles, one large section. */
export function PageSkeleton({ kpis = 4 }: { kpis?: number }) {
  return (
    <div className="space-y-6">
      <Skeleton height="132px" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: kpis }).map((_, i) => (
          <Skeleton key={i} height="124px" />
        ))}
      </div>
      <Skeleton height="420px" />
    </div>
  );
}

export const AdminPageSkeleton = PageSkeleton;

/** Shown when the first load fails (nothing to display yet). */
export function LoadError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card variant="glass" radius="xl" padding="lg">
      <EmptyState
        icon={<ServerCog className="size-6" />}
        title={title}
        description={message}
        action={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={onRetry}
          >
            Try again
          </Button>
        }
      />
    </Card>
  );
}

export const AdminLoadError = LoadError;

/**
 * Background refresh failures are not shown: the last loaded data stays on screen and the
 * next refresh retries (expired tokens are renewed by the api client). Kept so existing
 * call sites compile; renders nothing.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StaleDataBanner(_props: { error: string }) {
  return null;
}

/** Empty section body with consistent spacing. */
export function SectionEmpty({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="py-10">
      <EmptyState
        size="sm"
        variant="subtle"
        icon={icon}
        title={title}
        description={description}
      />
    </div>
  );
}
