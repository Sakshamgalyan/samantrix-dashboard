"use client";

import { Chip, Input, Tabs } from "@galyan/ui";
import { Clock, Code2, Search, ShieldBan, UserCheck, Wifi } from "lucide-react";
import {
  AdminHero,
  AdminLoadError,
  AdminPageSkeleton,
  GlassSection,
  KpiCard,
  SectionEmpty,
  StaleDataBanner,
} from "@/components/admin";
import { useDevelopersContext } from "../context";
import type { DeveloperTab } from "../types";
import { DevelopersTable } from "./developers-table";
import { DecisionDialog } from "./decision-dialog";

export function DevelopersContent() {
  const { state, onlineCount, setTab, setSearch, refresh } =
    useDevelopersContext();
  const { data, error, refreshing, tab, search } = state;

  if (!data) {
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

  const { counts } = data;
  const tabs = [
    { id: "ALL", label: `All · ${counts.total}` },
    { id: "PENDING_VERIFICATION", label: `Pending · ${counts.pending}` },
    { id: "ACTIVE", label: `Active · ${counts.active}` },
    { id: "INACTIVE", label: `Rejected · ${counts.rejected}` },
    ...(counts.suspended
      ? [{ id: "SUSPENDED", label: `Suspended · ${counts.suspended}` }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {error && <StaleDataBanner error={error} />}

      <AdminHero
        title="Developer access"
        description="Review developer sign-ups, choose what each developer can do, and revoke access. Developers are emailed every decision; revoking signs them out on every device."
        chips={
          <>
            <Chip variant="soft" size="sm">
              Admin governance
            </Chip>
            {counts.pending > 0 && (
              <Chip variant="warning" size="sm">
                {counts.pending} awaiting review
              </Chip>
            )}
          </>
        }
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pending review"
          value={counts.pending}
          caption="waiting for a decision"
          icon={<Clock className="size-4" />}
          tone="warning"
        />
        <KpiCard
          label="Active developers"
          value={counts.active}
          caption="can sign in to the console"
          icon={<UserCheck className="size-4" />}
          tone="success"
        />
        <KpiCard
          label="Online now"
          value={onlineCount}
          caption="with an active session"
          icon={<Wifi className="size-4" />}
          tone="primary"
        />
        <KpiCard
          label="Access removed"
          value={counts.rejected + counts.suspended}
          caption={
            counts.suspended
              ? `${counts.rejected} rejected · ${counts.suspended} suspended`
              : "rejected or revoked"
          }
          icon={<ShieldBan className="size-4" />}
          tone="danger"
        />
      </div>

      <GlassSection
        title={
          <Tabs
            items={tabs}
            activeTab={tab}
            onTabChange={(id) => setTab(id as DeveloperTab)}
            variant="button"
            size="sm"
          />
        }
        aside={
          <div className="w-full sm:w-72">
            <Input
              size="sm"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="size-3.5" />}
              clearable
              onClear={() => setSearch("")}
              fullWidth
              aria-label="Search developers"
            />
          </div>
        }
      >
        {counts.total === 0 ? (
          <SectionEmpty
            icon={<Code2 className="size-5" />}
            title="No developer accounts yet"
            description="Developers who register appear here for review."
          />
        ) : (
          <DevelopersTable />
        )}
      </GlassSection>

      <DecisionDialog />
    </div>
  );
}
