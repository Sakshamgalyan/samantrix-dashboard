"use client";

import React from "react";
import { Button, Chip } from "@galyan/ui";
import { Zap } from "lucide-react";
import { AdminHero } from "@/components/layout/common/hero";
import { useEcosystem } from "@/features/ecosystem/context";

interface EcosystemHeaderProps {
  onRunPings: () => void;
}

export const EcosystemHeader = ({ onRunPings }: EcosystemHeaderProps) => {
  const { state } = useEcosystem();
  const { isPinging, lastManualRefreshAt } = state;

  return (
    <AdminHero
      title="Ecosystem service mesh"
      description="Live topology, memory profiles, runtime ports, and HTTP probes across all 4 Simantrix micro-apps (Backend, Frontend, Home, and Desktop)."
      chips={
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip
            variant="success"
            size="sm"
            icon={<span className="size-1.5 rounded-full bg-[var(--gy-success)] animate-pulse" />}
          >
            Live Telemetry
          </Chip>
          <Chip variant="soft" size="sm">
            4 Applications Monitored
          </Chip>
        </div>
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={onRunPings}
          disabled={isPinging}
          className="text-xs"
        >
          <Zap className={`size-3.5 mr-1.5 ${isPinging ? "animate-bounce text-[var(--gy-warning)]" : "text-[var(--gy-warning)]"}`} />
          {isPinging ? "Probing Ports..." : "Test Latency"}
        </Button>
      }
      updatedAt={new Date(lastManualRefreshAt).toISOString()}
    />
  );
};

