"use client";

import {
  Button,
  Chip,
  Input,
  Table,
  Tabs,
  Tooltip,
  type Column,
} from "@galyan/ui";
import { Ban, Building2, Eye, PlayCircle, Search } from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import { formatDate, formatMoney, titleCase } from "@/lib/format";
import { useOrganizationsContext } from "../context";
import type { AdminOrganization, StatusTab } from "../types";
import {
  CAN_ACTIVATE,
  CAN_SUSPEND,
  PLAN_META,
  STATUS_META,
  initials,
} from "../common/constants";

export function OrganizationsTable() {
  const {
    state,
    visible,
    canManage,
    setTab,
    setSearch,
    openDetail,
    openStatusDialog,
  } = useOrganizationsContext();
  const counts = state.data?.counts;
  if (!state.data || !counts) return null;

  const tabs: { id: StatusTab; label: string }[] = [
    { id: "ALL", label: `All · ${counts.total}` },
    { id: "ACTIVE", label: `Active · ${counts.active}` },
    { id: "TRIAL", label: `Trial · ${counts.trial}` },
    ...(counts.pending
      ? [{ id: "PENDING" as const, label: `Pending · ${counts.pending}` }]
      : []),
    { id: "SUSPENDED", label: `Suspended · ${counts.suspended}` },
    ...(counts.cancelled
      ? [{ id: "CANCELLED" as const, label: `Cancelled · ${counts.cancelled}` }]
      : []),
  ];

  const columns: Column<AdminOrganization>[] = [
    {
      key: "name",
      header: "Organization",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--gy-primary)]/12 text-xs font-semibold text-[var(--gy-primary)]">
            {initials(row.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--gy-text)]">
              {row.name}
            </div>
            <div className="truncate text-xs text-[var(--gy-text-secondary)]">
              {row.slug}
            </div>
            {(row.industry || row.country) && (
              <div className="truncate text-[11px] text-[var(--gy-text-subtle)]">
                {[row.industry, row.country].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      width: "180px",
      accessor: (row) => (
        <div className="min-w-0 text-xs">
          <div className="truncate text-sm text-[var(--gy-text)]">
            {row.owner.fullName}
          </div>
          <div className="truncate text-[var(--gy-text-secondary)]">
            {row.owner.email}
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      width: "120px",
      accessor: (row) => (
        <div className="space-y-1">
          <Chip
            size="sm"
            variant={PLAN_META[row.planTier]?.variant ?? "neutral"}
          >
            <span className="whitespace-nowrap">
              {PLAN_META[row.planTier]?.label ?? titleCase(row.planTier)}
            </span>
          </Chip>
          <div className="text-[11px] text-[var(--gy-text-subtle)]">
            {titleCase(row.billingCycle)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      accessor: (row) => (
        <Chip size="sm" variant={STATUS_META[row.status]?.variant ?? "neutral"}>
          <span className="whitespace-nowrap">
            {STATUS_META[row.status]?.label ?? titleCase(row.status)}
          </span>
        </Chip>
      ),
    },
    {
      key: "members",
      header: "Members",
      width: "90px",
      align: "right",
      accessor: (row) => (
        <div className="text-right text-xs">
          <div className="text-sm font-medium text-[var(--gy-text)]">
            {row.memberCount}
          </div>
          <div className="whitespace-nowrap text-[var(--gy-text-subtle)]">
            of {row.maxMembers}
          </div>
        </div>
      ),
    },
    {
      key: "subscription",
      header: "Subscription",
      width: "130px",
      accessor: (row) =>
        row.subscription ? (
          <div className="text-xs">
            <div className="whitespace-nowrap text-sm text-[var(--gy-text)]">
              {formatMoney(
                row.subscription.amount,
                row.subscription.currency,
                2,
              )}
              <span className="text-xs text-[var(--gy-text-subtle)]">
                /{row.billingCycle === "YEARLY" ? "yr" : "mo"}
              </span>
            </div>
            <div className="whitespace-nowrap text-[var(--gy-text-subtle)]">
              {titleCase(row.subscription.status)}
            </div>
          </div>
        ) : (
          <span className="text-xs text-[var(--gy-text-subtle)]">
            No subscription
          </span>
        ),
    },
    {
      key: "createdAt",
      header: "Created",
      width: "100px",
      accessor: (row) => (
        <span className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "90px",
      align: "right",
      accessor: (row) => {
        const suspendable = CAN_SUSPEND.includes(row.status);
        const activatable = CAN_ACTIVATE.includes(row.status);
        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip content="View details" position="left" size="sm">
              <Button
                variant="glass"
                size="xs"
                aria-label={`View ${row.name}`}
                onClick={() => openDetail(row.id)}
              >
                <Eye className="size-3.5" />
              </Button>
            </Tooltip>
            {canManage && suspendable && (
              <Tooltip content="Suspend" position="left" size="sm">
                <Button
                  variant="danger-soft"
                  size="xs"
                  aria-label={`Suspend ${row.name}`}
                  onClick={() => openStatusDialog(row, "SUSPENDED")}
                >
                  <Ban className="size-3.5" />
                </Button>
              </Tooltip>
            )}
            {canManage && !suspendable && activatable && (
              <Tooltip content="Activate" position="left" size="sm">
                <Button
                  variant="success"
                  size="xs"
                  aria-label={`Activate ${row.name}`}
                  onClick={() => openStatusDialog(row, "ACTIVE")}
                >
                  <PlayCircle className="size-3.5" />
                </Button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <GlassSection
      title="Tenant organizations"
      subtitle={
        state.data.organizations.length < counts.total
          ? `Newest ${state.data.organizations.length} of ${counts.total} organizations`
          : "Every organization on the platform, newest first"
      }
    >
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <Tabs
          items={tabs}
          activeTab={state.tab}
          onTabChange={(id) => setTab(id as StatusTab)}
          variant="button"
          size="sm"
        />
        <div className="w-full lg:w-72">
          <Input
            size="sm"
            placeholder="Search name, slug or owner…"
            value={state.search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="size-3.5" />}
            clearable
            onClear={() => setSearch("")}
            fullWidth
            aria-label="Search organizations"
          />
        </div>
      </div>

      {counts.total === 0 ? (
        <SectionEmpty
          icon={<Building2 className="size-5" />}
          title="No organizations yet"
          description="Organizations appear here as soon as someone registers one."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table<AdminOrganization>
            columns={columns}
            data={visible}
            rowKey={(row) => row.id}
            hoverable
            size="md"
            onRowClick={(row) => openDetail(row.id)}
            emptyStateLabel="No organizations match"
            emptyStateMessage="Try another status tab or search term."
          />
        </div>
      )}
    </GlassSection>
  );
}
