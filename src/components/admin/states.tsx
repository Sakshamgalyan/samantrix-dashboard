"use client";

import type React from "react";
import { Banner, Button, Card, EmptyState, Skeleton } from "@galyan/ui";
import { RefreshCw, ServerCog } from "lucide-react";

/** First-load placeholder: hero, KPI tiles, one large section. */
export function AdminPageSkeleton({ kpis = 4 }: { kpis?: number }) {
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

/** Shown when the first load fails (nothing to display yet). */
export function AdminLoadError({
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

/** Shown above stale data when a background refresh fails. */
export function StaleDataBanner({ error }: { error: string }) {
  return (
    <Banner
      variant="warning"
      size="sm"
      bannerStyle="subtle"
      description={`Refresh failed: ${error}. Showing the last loaded data.`}
    />
  );
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
