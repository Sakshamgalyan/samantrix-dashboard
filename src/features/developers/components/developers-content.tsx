"use client";

import { Dropdown, Input } from "@galyan/ui";
import {
  Clock,
  Code2,
  Search,
  ShieldBan,
  UserCheck,
  Users,
} from "lucide-react";
import { AdminLoadError, AdminPageSkeleton, SectionEmpty } from "@/components/layout/common/states";
import { GlassSection } from "@/components/layout/common/glass-section";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { useDevelopersContext } from "@/features/developers/context";
import { ROLE_FILTERS, STATUS_FILTERS } from "@/features/developers/common/constants";
import type { RoleFilter, StatusFilter } from "@/features/developers/types";
import { DevelopersTable } from "@/features/developers/components/developers-table";
import { PendingQueue } from "@/features/developers/components/pending-queue";
import { DecisionDialog } from "@/features/developers/components/decision-dialog";

export function DevelopersContent() {
  const {
    state,
    pendingDevelopers,
    setStatusFilter,
    setRoleFilter,
    setSearch,
    refresh,
  } = useDevelopersContext();
  const { summary, error, statusFilter, roleFilter, search, meta } =
    state;

  if (!summary) {
    return error ? (
      <AdminLoadError
        title="Developer accounts unavailable"
        message={error}
        onRetry={refresh}
      />
    ) : (
      <AdminPageSkeleton />
    );
  }

  const { counts } = summary;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <KpiCard
          label="Total developers"
          value={counts.total}
          caption={`${counts.online} online now`}
          icon={<Users className="size-4" />}
          tone="primary"
        />
        <KpiCard
          label="Pending approval"
          value={counts.pending}
          caption="waiting for a decision"
          icon={<Clock className="size-4" />}
          tone="warning"
        />
        <KpiCard
          label="Active"
          value={counts.active}
          caption="can sign in to the console"
          icon={<UserCheck className="size-4" />}
          tone="success"
        />
        <KpiCard
          label="Suspended"
          value={counts.suspended}
          caption={`${counts.rejected} rejected`}
          icon={<ShieldBan className="size-4" />}
          tone="danger"
        />
      </div>

      {pendingDevelopers.length > 0 && <PendingQueue />}

      <GlassSection
        title="All developers"
        subtitle={`${meta?.total ?? 0} of ${counts.total} shown`}
        aside={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="w-full sm:w-56 md:w-64">
              <Input
                size="sm"
                placeholder="Search name, email, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="size-3.5" />}
                clearable
                onClear={() => setSearch("")}
                fullWidth
                aria-label="Search developers"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
              <div className="w-full sm:w-36">
                <Dropdown
                  size="sm"
                  options={STATUS_FILTERS}
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v as StatusFilter)}
                  aria-label="Filter by status"
                />
              </div>
              <div className="w-full sm:w-36">
                <Dropdown
                  size="sm"
                  options={ROLE_FILTERS}
                  value={roleFilter}
                  onChange={(v) => setRoleFilter(v as RoleFilter)}
                  aria-label="Filter by role"
                />
              </div>
            </div>
          </div>
        }
      >
        {counts.total === 0 ? (
          <SectionEmpty
            icon={<Code2 className="size-5" />}
            title="No developer accounts yet"
            description="Developers who register appear here for approval."
          />
        ) : (
          <DevelopersTable />
        )}
      </GlassSection>

      <DecisionDialog />
    </div>
  );
}
