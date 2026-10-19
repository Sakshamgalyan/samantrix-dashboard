"use client";

import React from "react";
import { Chip } from "@galyan/ui";
import { AdminHero } from "@/components/layout/common/hero";

export const PlatformAuditHeader = () => {
  return (
    <AdminHero
      title="Platform Security & Audit Trail"
      description="Cross-tenant audit trail: administrative overrides, privilege changes, and security operations."
      chips={
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip
            variant="success"
            size="sm"
            icon={<span className="size-1.5 rounded-full bg-[var(--gy-success)] animate-pulse" />}
          >
            Immutable MongoDB
          </Chip>
          <Chip variant="soft" size="sm">
            Platform Security
          </Chip>
          <Chip
            variant="neutral"
            size="sm"
            icon={<span className="size-1.5 rounded-full bg-[var(--gy-success)] animate-pulse" />}
          >
            Live Ingestion
          </Chip>
        </div>
      }
    />
  );
};
