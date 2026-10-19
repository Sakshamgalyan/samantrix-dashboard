"use client";

import dynamic from "next/dynamic";
import { Button, Chip } from "@galyan/ui";
import { Plus } from "lucide-react";
import { AdminHero } from "@/components/layout/common/hero";
import { AdminLoadError, AdminPageSkeleton } from "@/components/layout/common/states";
import { useOrganizationsContext } from "@/features/organizations/context";
import { PLAN_META, PLAN_ORDER } from "@/features/organizations/common/constants";
import { OrganizationsKpis } from "@/features/organizations/components/organizations-kpis";
import { OrganizationsTable } from "@/features/organizations/components/organizations-table";

const OrganizationDetailModal = dynamic(
  () =>
    import("@/features/organizations/components/organization-detail-modal").then(
      (m) => m.OrganizationDetailModal,
    ),
  { ssr: false },
);

const StatusChangeModal = dynamic(
  () =>
    import("@/features/organizations/components/status-change-modal").then(
      (m) => m.StatusChangeModal,
    ),
  { ssr: false },
);

const OrganizationFormModal = dynamic(
  () =>
    import("@/features/organizations/components/organization-form-modal").then(
      (m) => m.OrganizationFormModal,
    ),
  { ssr: false },
);

const SubscriptionModal = dynamic(
  () =>
    import("@/features/organizations/components/subscription-modal").then(
      (m) => m.SubscriptionModal,
    ),
  { ssr: false },
);

const DeleteOrganizationModal = dynamic(
  () =>
    import("@/features/organizations/components/delete-organization-modal").then(
      (m) => m.DeleteOrganizationModal,
    ),
  { ssr: false },
);

export const OrganizationsContent = () => {
  // The list refreshes itself every minute (polling lives in the context)
  const { state, refresh, canManage, openCreate } = useOrganizationsContext();

  const { summary, error } = state;

  if (!summary) {
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

  const plans = PLAN_ORDER.filter((p) => summary.counts.byPlan[p] > 0);

  return (
    <div className="space-y-4">
      <AdminHero
        title="Organizations"
        description={
          canManage
            ? "Create and edit customer organizations, assign subscriptions and seats, and change their status."
            : "Customer organizations with their owner, plan, seats and status."
        }
        chips={plans.map((p) => (
          <Chip key={p} variant="outline" size="sm">
            {PLAN_META[p].label} · {summary.counts.byPlan[p]}
          </Chip>
        ))}
        actions={
          canManage ? (
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              leftIcon={<Plus className="size-3.5" />}
              onClick={openCreate}
            >
              New organization
            </Button>
          ) : undefined
        }
        updatedAt={summary.generatedAt}
      />

      <OrganizationsKpis />
      <OrganizationsTable />

      <OrganizationDetailModal />
      <StatusChangeModal />
      <OrganizationFormModal />
      <SubscriptionModal />
      <DeleteOrganizationModal />
    </div>
  );
};

