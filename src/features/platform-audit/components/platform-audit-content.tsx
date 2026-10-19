"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Banner } from "@galyan/ui";
import { usePlatformAudit } from "@/features/platform-audit/context";
import {
  useGetPlatformAuditLogsQuery,
  useGetPlatformAuditSummaryQuery,
} from "@/features/platform-audit/context/api";
import { PlatformAuditHeader } from "@/features/platform-audit/components/platform-audit-header";
import { PlatformAuditKPIs } from "@/features/platform-audit/components/platform-audit-kpis";
import { PlatformAuditTable } from "@/features/platform-audit/components/platform-audit-table";

const PlatformAuditModal = dynamic(
  () => import("@/features/platform-audit/components/platform-audit-modal").then((m) => m.PlatformAuditModal),
  { ssr: false },
);

export const PlatformAuditContent = () => {
  const { state } = usePlatformAudit();
  const { page, categoryFilter } = state;

  const {
    data: logsResponse,
    isLoading: isLogsLoading,
    error: logsError,
  } = useGetPlatformAuditLogsQuery({
    page,
    limit: 15,
    category: categoryFilter,
  });

  const {
    data: summary,
    isLoading: isSummaryLoading,
  } = useGetPlatformAuditSummaryQuery();

  return (
    <div className="space-y-4">
      {/* Header */}
      <PlatformAuditHeader />

      {/* Disconnection Warning */}
      {logsError && (
        <Banner
          variant="danger"
          title="Audit Service Unreachable"
          description="Failed to query MongoDB audit trail from simantrix-backend. Ensure the audit microservice is online."
        />
      )}

      {/* KPIs */}
      <PlatformAuditKPIs
        summary={summary}
        isLoading={isSummaryLoading}
      />

      {/* Logs Table with Filters */}
      <PlatformAuditTable
        logs={logsResponse?.data ?? []}
        isLoading={isLogsLoading}
        meta={logsResponse?.meta}
      />

      {/* Inspection Modal */}
      <PlatformAuditModal />
    </div>
  );
};
