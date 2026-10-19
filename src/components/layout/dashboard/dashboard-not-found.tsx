"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Card, Chip, Typography } from "@galyan/ui";
import { ArrowLeft, Compass, Home } from "lucide-react";
import { useConsoleScope } from "@/components/layout/scope-context";

export function DashboardNotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const scope = useConsoleScope();

  const homePath = scope === "admin" ? "/admin" : "/organization";
  const homeLabel = scope === "admin" ? "Developer Overview" : "Workspace Overview";

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <Card
        variant="glass"
        radius="xl"
        padding="lg"
        className="w-full max-w-lg text-center backdrop-blur-xl border border-[var(--gy-border)] shadow-2xl"
      >
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)] shadow-inner">
          <Compass className="size-8 animate-pulse" />
        </div>

        <div className="mb-2 flex items-center justify-center gap-2">
          <Chip variant="warning" size="sm">
            404 · Not Found
          </Chip>
        </div>

        <Typography
          variant="h2"
          className="text-xl font-bold tracking-tight text-[var(--gy-text)] sm:text-2xl"
        >
          Page not found
        </Typography>

        <Typography
          variant="p"
          className="mx-auto mt-2 max-w-sm text-sm text-[var(--gy-text-secondary)]"
        >
          The page you are looking for does not exist, has been moved, or is not available in your current workspace scope.
        </Typography>

        {pathname && (
          <div className="mx-auto mt-4 inline-flex items-center rounded-lg border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] px-2.5 py-1 text-xs font-mono text-[var(--gy-text-subtle)]">
            {pathname}
          </div>
        )}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<ArrowLeft className="size-4" />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Home className="size-4" />}
            onClick={() => router.push(homePath)}
          >
            {homeLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default DashboardNotFound;
