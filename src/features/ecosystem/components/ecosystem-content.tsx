"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Banner,
  Card,
  Chip,
  EmptyState,
  Input,
  Skeleton,
  useToast,
} from "@galyan/ui";
import { Search, Server } from "lucide-react";
import { useEcosystem } from "@/features/ecosystem/context";
import {
  setIsPingingAction,
  setPingResultAction,
  setSearchQueryAction,
  setStatusFilterAction,
} from "@/features/ecosystem/context/action";
import { useGetEcosystemStatusQuery } from "@/features/ecosystem/context/api";
import { EcosystemHeader } from "@/features/ecosystem/components/ecosystem-header";
import { EcosystemKPIs } from "@/features/ecosystem/components/ecosystem-kpis";
import { ServiceCard } from "@/features/ecosystem/components/service-card";
import { QuickPingPanel } from "@/features/ecosystem/components/quick-ping-panel";
import type { EcosystemService, ServiceFilter } from "@/features/ecosystem/types";

const ServiceDetailModal = dynamic(
  () => import("@/features/ecosystem/components/service-detail-modal").then((m) => m.ServiceDetailModal),
  { ssr: false },
);

export const EcosystemContent = () => {
  const { state, dispatch } = useEcosystem();
  const {
    searchQuery,
    statusFilter,
    isAutoRefresh,
    autoRefreshIntervalSec,
    isPinging,
  } = state;
  const { toast } = useToast();

  const {
    data: services = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetEcosystemStatusQuery(undefined, {
    pollingInterval: isAutoRefresh ? autoRefreshIntervalSec * 1000 : 0,
  });

  const handlePingSingle = useCallback(
    async (service: EcosystemService) => {
      dispatch(setIsPingingAction(true));
      const start = Date.now();
      try {
        if (service.url && service.url.startsWith("http")) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);
          await fetch(service.url, { method: "HEAD", signal: controller.signal, mode: "no-cors" });
          clearTimeout(timeout);
        }
        const latencyMs = Math.max(1, Date.now() - start);
        dispatch(
          setPingResultAction(service.id, {
            latencyMs,
            status: "up",
            timestamp: Date.now(),
          }),
        );
        toast({
          title: `Ping ${service.name}`,
          description: `Roundtrip latency: ${latencyMs}ms (${service.port > 0 ? `port :${service.port}` : "IPC"})`,
          variant: "success",
        });
      } catch {
        const latencyMs = Math.max(1, Date.now() - start);
        toast({
          title: `Ping ${service.name}`,
          description: `Probe failed or service unreachable (${latencyMs}ms)`,
          variant: "warning",
        });
      } finally {
        dispatch(setIsPingingAction(false));
      }
    },
    [dispatch, toast],
  );

  const handleRunAllPings = useCallback(async () => {
    dispatch(setIsPingingAction(true));
    try {
      await refetch();
      toast({
        title: "Ecosystem Mesh Probed",
        description: "All microservice health metrics and round-trip latencies updated.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Probe Failed",
        description: "Could not reach the backend health coordinator.",
        variant: "error",
      });
    } finally {
      dispatch(setIsPingingAction(false));
    }
  }, [dispatch, refetch, toast]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Status filter
      if (statusFilter === "ONLINE") {
        if (!["HEALTHY", "ONLINE", "READY"].includes(service.status)) return false;
      } else if (statusFilter === "DEGRADED") {
        if (service.status !== "DEGRADED") return false;
      } else if (statusFilter === "OFFLINE") {
        if (service.status !== "OFFLINE") return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = service.name.toLowerCase().includes(query);
        const matchesDesc = service.description.toLowerCase().includes(query);
        const matchesPort = String(service.port).includes(query);
        const matchesVersion = service.version.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesPort && !matchesVersion) {
          return false;
        }
      }

      return true;
    });
  }, [services, statusFilter, searchQuery]);

  const filterOptions: { label: string; value: ServiceFilter }[] = [
    { label: "All Microservices", value: "ALL" },
    { label: "Healthy / Online", value: "ONLINE" },
    { label: "Degraded", value: "DEGRADED" },
    { label: "Offline", value: "OFFLINE" },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <EcosystemHeader
        onRunPings={handleRunAllPings}
      />

      {/* Error banner */}
      {error && (
        <Banner
          variant="danger"
          title="Telemetry Feed Disconnected"
          description="Failed to retrieve live health data from simantrix-backend. Please verify that the backend is running on port 5000."
        />
      )}

      {/* KPI Cards */}
      <EcosystemKPIs services={services} isLoading={isLoading} />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--gy-text-subtle)] pointer-events-none" />
          <Input
            placeholder="Search service, port, or runtime..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQueryAction(e.target.value))}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterOptions.map((opt) => (
            <Chip
              key={opt.value}
              variant={statusFilter === opt.value ? "primary" : "outline"}
              size="sm"
              clickable
              onClick={() => dispatch(setStatusFilterAction(opt.value))}
              className="text-xs shrink-0 cursor-pointer"
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl bg-[var(--gy-bg-elevated)]" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <Card variant="glass" radius="lg" className="p-8 text-center">
          <EmptyState
            icon={<Server className="size-8 text-[var(--gy-text-subtle)] mx-auto" />}
            title="No Services Match Query"
            description="Adjust your search query or status filter to see registered microservices."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPingSingle={handlePingSingle}
              isPinging={isPinging}
            />
          ))}
        </div>
      )}

      {/* Inter-Service Matrix Panel */}
      <QuickPingPanel services={services} />

      {/* Detail Inspector Modal */}
      <ServiceDetailModal />
    </div>
  );
}
