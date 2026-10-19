"use client";

import { useMemo } from "react";
import {
  Button,
  Chip,
  Dropdown,
  Input,
  Menu,
  Table,
  type Column,
  type MenuItem,
} from "@galyan/ui";
import {
  Ban,
  Building2,
  CreditCard,
  Eye,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  Search,
  Trash2,
} from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { tablePagination } from "@/features/common/pagination";
import { formatDate, formatMoney, titleCase } from "@/utils/format";
import { useMounted } from "@/hooks/use-mounted";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOrganizationsContext } from "@/features/organizations/context";
import type { AdminOrganization, PlanFilter, StatusTab } from "@/features/organizations/types";
import {
  CAN_ACTIVATE,
  CAN_SUSPEND,
  PLAN_FILTER_OPTIONS,
  PLAN_META,
  STATUS_FILTER_OPTIONS,
  STATUS_META,
  initials,
  seatsOf,
} from "@/features/organizations/common/constants";

type RowAction = "view" | "edit" | "subscription" | "suspend" | "activate" | "delete";

const RowActions = ({ row }: { row: AdminOrganization }) => {
  const {
    canManage,
    canHardDelete,
    openDetail,
    openEdit,
    openSubscription,
    openStatusDialog,
    openDelete,
  } = useOrganizationsContext();

  if (!canManage) {
    return (
      <Button
        variant="ghost"
        size="xs"
        aria-label={`View ${row.name}`}
        leftIcon={<Eye className="size-3.5" />}
        onClick={() => openDetail(row.id)}
      />
    );
  }

  const suspendable = CAN_SUSPEND.includes(row.status);
  const activatable = CAN_ACTIVATE.includes(row.status);
  const deletable = row.status !== "DELETED" || canHardDelete;

  const items: MenuItem[] = [
    { id: "view", label: "View details", icon: <Eye className="size-3.5" /> },
    { id: "edit", label: "Edit", icon: <Pencil className="size-3.5" /> },
    {
      id: "subscription",
      label: "Assign subscription",
      icon: <CreditCard className="size-3.5" />,
    },
    ...(activatable
      ? [
          {
            id: "activate",
            label: row.status === "DELETED" ? "Restore" : "Activate",
            icon: <PlayCircle className="size-3.5" />,
          },
        ]
      : []),
    ...(suspendable
      ? [{ id: "suspend", label: "Suspend", icon: <Ban className="size-3.5" /> }]
      : []),
    ...(deletable
      ? [
          {
            id: "delete",
            label: row.status === "DELETED" ? "Delete permanently" : "Delete",
            icon: <Trash2 className="size-3.5" />,
            divider: true,
          },
        ]
      : []),
  ];

  const run = (id: RowAction) => {
    if (id === "view") openDetail(row.id);
    else if (id === "edit") void openEdit(row.id);
    else if (id === "subscription") openSubscription(row);
    else if (id === "suspend") openStatusDialog(row, "SUSPENDED");
    else if (id === "activate") openStatusDialog(row, "ACTIVE");
    else if (id === "delete") openDelete(row);
  };

  return (
    <Menu
      items={items}
      size="sm"
      variant="bordered"
      placement="bottom-end"
      width={190}
      onItemClick={(id) => run(id as RowAction)}
      trigger={
        <Button
          variant="ghost"
          size="xs"
          leftIcon={<MoreHorizontal className="size-4" />}
          aria-label={`Actions for ${row.name}`}
        />
      }
    />
  );
};

export const OrganizationsTable = () => {
  const { state, setTab, setPlan, setSearch, setPage, openDetail } =
    useOrganizationsContext();
  const isMounted = useMounted();
  const isTablet = useMediaQuery("(min-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const showTabletColumns = !isMounted || isTablet;
  const showDesktopColumns = !isMounted || isDesktop;

  const counts = state.summary?.counts;
  const shown = state.meta?.total ?? 0;

  const filtered =
    state.tab !== "ALL" || state.plan !== "ALL" || state.search.trim() !== "";

  const columns: Column<AdminOrganization>[] = useMemo(() => {
    return [
      {
        key: "name",
        header: "Organization",
        width: showTabletColumns ? "280px" : "220px",
        accessor: (row) => {
          const { used, purchased } = seatsOf(row);
          const subtitle =
            [row.industry, row.country].filter(Boolean).join(" · ") || row.slug;
          return (
            <div className="flex items-center gap-2.5 min-w-0 max-w-full overflow-hidden">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/12 text-xs font-semibold text-[var(--gy-primary)]">
                {initials(row.name)}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div
                  className="truncate text-sm font-medium text-[var(--gy-text)] block max-w-full"
                  title={row.name}
                >
                  {row.name}
                </div>
                {showTabletColumns ? (
                  <div
                    className="truncate text-xs text-[var(--gy-text-subtle)] block max-w-full"
                    title={subtitle}
                  >
                    {subtitle}
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    <div
                      className="truncate text-xs text-[var(--gy-text-secondary)] block max-w-full"
                      title={`${row.owner.fullName} · ${used}/${purchased} seats`}
                    >
                      {row.owner.fullName} · {used}/{purchased} seats
                    </div>
                    <div
                      className="truncate text-[11px] text-[var(--gy-text-subtle)] block max-w-full"
                      title={subtitle}
                    >
                      {subtitle}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      ...(showTabletColumns
        ? [
            {
              key: "owner",
              header: "Owner",
              width: "220px",
              accessor: (row: AdminOrganization) => (
                <div className="min-w-0 max-w-full overflow-hidden">
                  <div
                    className="truncate text-sm font-medium text-[var(--gy-text)] block max-w-full"
                    title={row.owner.fullName}
                  >
                    {row.owner.fullName}
                  </div>
                  <div
                    className="truncate text-xs text-[var(--gy-text-secondary)] block max-w-full"
                    title={row.owner.email}
                  >
                    {row.owner.email}
                  </div>
                </div>
              ),
            },
          ]
        : []),
      {
        key: "plan",
        header: "Plan",
        width: "140px",
        accessor: (row) => (
          <div className="flex flex-col items-start gap-0.5 min-w-0 max-w-full">
            <Chip size="sm" variant={PLAN_META[row.planTier]?.variant ?? "neutral"}>
              <span className="whitespace-nowrap">
                {PLAN_META[row.planTier]?.label ?? titleCase(row.planTier)}
              </span>
            </Chip>
            <span className="whitespace-nowrap text-[11px] text-[var(--gy-text-subtle)]">
              {row.subscription
                ? `${formatMoney(row.subscription.amount, row.subscription.currency)}/${row.subscription.billingCycle === "YEARLY" ? "yr" : "mo"}`
                : titleCase(row.billingCycle)}
            </span>
          </div>
        ),
      },
      ...(showTabletColumns
        ? [
            {
              key: "seats",
              header: "Seats",
              width: "120px",
              accessor: (row: AdminOrganization) => {
                const { used, purchased } = seatsOf(row);
                const pct = purchased
                  ? Math.min(100, Math.round((used / purchased) * 100))
                  : 0;
                return (
                  <div className="w-20 min-w-0">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-[var(--gy-text)]">{used}</span>
                      <span className="text-[var(--gy-text-subtle)]">/ {purchased}</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--gy-border)]">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? "bg-[var(--gy-warning)]" : "bg-[var(--gy-primary)]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              },
            },
          ]
        : []),
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
      ...(showDesktopColumns
        ? [
            {
              key: "createdAt",
              header: "Created",
              width: "110px",
              accessor: (row: AdminOrganization) => (
                <span className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]">
                  {formatDate(row.createdAt)}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "actions",
        header: "",
        width: "56px",
        align: "right",
        accessor: (row) => (
          <div
            className="flex justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <RowActions row={row} />
          </div>
        ),
      },
    ];
  }, [showTabletColumns, showDesktopColumns]);

  if (!counts) return null;

  return (
    <GlassSection
      title="Organizations"
      subtitle={
        filtered
          ? `${shown} of ${counts.total} match`
          : `${counts.total} organization${counts.total === 1 ? "" : "s"}, newest first`
      }
      headerClassName="xl:flex-row xl:items-center"
      aside={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center xl:w-auto">
          <div className="w-full sm:w-64 md:w-72">
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
          <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
            <div className="w-full sm:w-36">
              <Dropdown
                size="sm"
                options={STATUS_FILTER_OPTIONS}
                value={state.tab}
                onChange={(v) => setTab(v as StatusTab)}
                aria-label="Filter by status"
              />
            </div>
            <div className="w-full sm:w-36">
              <Dropdown
                size="sm"
                options={PLAN_FILTER_OPTIONS}
                value={state.plan}
                onChange={(v) => setPlan(v as PlanFilter)}
                aria-label="Filter by plan"
              />
            </div>
          </div>
        </div>
      }
    >
      {counts.total === 0 ? (
        <SectionEmpty
          icon={<Building2 className="size-5" />}
          title="No organizations yet"
          description="Organizations appear here when someone registers one or you create one."
        />
      ) : (
        <div className="w-full overflow-x-auto">
          <Table<AdminOrganization>
            columns={columns}
            data={state.rows}
            rowKey={(row) => row.id}
            hoverable
            size="sm"
            isLoading={state.listLoading}
            pagination={tablePagination(state.meta)}
            onPageChange={setPage}
            responsive="scroll"
            onRowClick={(row) => openDetail(row.id)}
            emptyStateLabel="No organizations match"
            emptyStateMessage="Try another status, plan or search term."
          />
        </div>
      )}
    </GlassSection>
  );
};
