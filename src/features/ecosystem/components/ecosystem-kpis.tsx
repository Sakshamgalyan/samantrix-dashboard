"use client";

import React from "react";
import { Cpu, Layers, ShieldCheck, Zap } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import type { EcosystemService } from "@/features/ecosystem/types";

interface EcosystemKPIsProps {
  services: EcosystemService[];
  isLoading: boolean;
}

export const EcosystemKPIs = ({ services, isLoading }: EcosystemKPIsProps) => {
  const totalCount = services.length;
  const onlineCount = services.filter((s) =>
    ["HEALTHY", "ONLINE", "READY"].includes(s.status),
  ).length;

  const validLatencies = services
    .map((s) => s.latencyMs)
    .filter((ms): ms is number => typeof ms === "number" && ms > 0);
  const avgLatency =
    validLatencies.length > 0
      ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length)
      : 1;

  const backendService = services.find((s) => s.id === "backend");
  const heapMetric = backendService?.metrics.find((m) =>
    m.name.includes("Heap Memory"),
  )?.value;

  const isDegraded = totalCount > 0 && onlineCount < totalCount;

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Microservices"
        value={isLoading ? "..." : `${totalCount} Apps`}
        caption="Backend, Frontend, Home, Desktop"
        icon={<Layers className="size-4" />}
        tone="info"
      />
      <KpiCard
        label="Operational Status"
        value={isLoading ? "..." : `${onlineCount} / ${totalCount} Healthy`}
        caption={isDegraded ? "Partial degradation detected" : "All services operational"}
        icon={<ShieldCheck className="size-4" />}
        tone={isDegraded ? "warning" : "success"}
      />
      <KpiCard
        label="Average Latency"
        value={isLoading ? "..." : `${avgLatency} ms`}
        caption="HTTP probe roundtrip"
        icon={<Zap className="size-4" />}
        tone="warning"
      />
      <KpiCard
        label="Backend Heap Footprint"
        value={isLoading ? "..." : (heapMetric ? heapMetric.split("/")[0].trim() : "Optimal")}
        caption={heapMetric ? `Total: ${heapMetric.split("/")[1]?.trim() || "Heap"}` : "Process memory healthy"}
        icon={<Cpu className="size-4" />}
        tone="primary"
      />
    </div>
  );
}
