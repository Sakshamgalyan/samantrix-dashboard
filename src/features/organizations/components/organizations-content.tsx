"use client";

import { Chip } from "@galyan/ui";
import {
  AdminHero,
  AdminLoadError,
  AdminPageSkeleton,
  StaleDataBanner,
  useAutoRefresh,
} from "@/components/admin";
import { useOrganizationsContext } from "../context";
import { PLAN_META, PLAN_ORDER } from "../common/constants";
import { OrganizationsKpis } from "./organizations-kpis";
import { OrganizationsTable } from "./organizations-table";
import { OrganizationDetailModal } from "./organization-detail-modal";
import { StatusChangeModal } from "./status-change-modal";

export function OrganizationsContent() {
  const { state, load, refresh, canManage } = useOrganizationsContext();
  useAutoRefresh(load);

  const { data, error } = state;

  if (!data) {
    return error ? (
      <AdminLoadError
        title="Organizations unavailable"
        message={error}
        onRetry={refresh}
      />
    ) : (
      <AdminPageSkeleton />
    );
  }

  const plans = PLAN_ORDER.filter((p) => data.counts.byPlan[p] > 0);

  return (
    <div className="space-y-6">
      {error && <StaleDataBanner error={error} />}

      <AdminHero
        title="Organizations"
        description={
          canManage
            ? "Every tenant on the platform with its owner, plan, subscription and seats. Open an organization to see its members and invoices, or suspend and re-activate it."
            : "Every tenant on the platform with its owner, plan, subscription and seats. Open an organization to see its members and invoices."
        }
        chips={
          <>
            <Chip variant="soft" size="sm">
              Tenant governance
            </Chip>
            {plans.map((p) => (
              <Chip key={p} variant="outline" size="sm">
                {PLAN_META[p].label} · {data.counts.byPlan[p]}
              </Chip>
            ))}
          </>
        }
        onRefresh={refresh}
        refreshing={state.refreshing}
        updatedAt={data.generatedAt}
      />

      <OrganizationsKpis />
      <OrganizationsTable />

      <OrganizationDetailModal />
      <StatusChangeModal />
    </div>
  );
}
