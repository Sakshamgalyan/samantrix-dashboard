"use client";

import React from "react";
import {
  Button,
  Card,
  Chip,
  Dropdown,
  Input,
  ProgressBar,
  Table,
  Tabs,
  Tooltip,
  Typography,
  type Column,
} from "@galyan/ui";
import {
  ArrowDownLeft,
  Gauge,
  Laptop,
  Pencil,
  Plus,
  RotateCcw,
  Rocket,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import { SectionEmpty } from "@/components/layout/common/states";
import { tablePagination } from "@/features/common/pagination";
import { formatDate, formatDateTime } from "@/utils/format";
import { useDebounce } from "@/hooks/use-debounce";
import {
  CHANNEL_META,
  STATUS_META,
} from "@/features/versioning/common/constants";
import { useVersioningContext } from "@/features/versioning/context";
import {
  RELEASE_CHANNELS,
  RELEASE_STATUSES,
  type ChannelFilter,
  type ReleaseListItem,
  type StatusFilter,
} from "@/features/versioning/types";

const CHANNEL_TABS = [
  { id: "ALL", label: "All Channels" },
  { id: "STABLE", label: "Stable (Prod)" },
  { id: "BETA", label: "Beta" },
  { id: "CANARY", label: "Canary" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  ...RELEASE_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label })),
];

const RolloutCell = ({ release }: { release: ReleaseListItem }) => {
  if (release.status === "DRAFT") {
    return (
      <span className="text-xs text-[var(--gy-text-subtle)]">Draft (0%)</span>
    );
  }
  const variant =
    release.status === "RELEASED"
      ? "success"
      : release.status === "ROLLED_BACK"
        ? "danger"
        : "warning";

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <ProgressBar
          progress={release.rolloutPercent}
          size="sm"
          variant={variant}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-[var(--gy-text-secondary)]">
        {release.rolloutPercent}%
      </span>
    </div>
  );
};

const ReleaseActions = ({ release }: { release: ReleaseListItem }) => {
  const { openDialog, canManage, canDelete } = useVersioningContext();
  if (!canManage) return null;

  const edit = (label: string) => (
    <Tooltip content={label} position="top" size="sm">
      <Button
        variant="ghost"
        size="xs"
        aria-label={label}
        onClick={() => openDialog({ kind: "edit", release })}
      >
        <Pencil className="size-3 text-[var(--gy-text-secondary)]" />
      </Button>
    </Tooltip>
  );

  const remove = canDelete ? (
    <Tooltip content="Delete release draft" position="top" size="sm">
      <Button
        variant="ghost"
        size="xs"
        aria-label="Delete release"
        onClick={() => openDialog({ kind: "delete", release })}
      >
        <Trash2 className="size-3 text-rose-400" />
      </Button>
    </Tooltip>
  ) : null;

  switch (release.status) {
    case "DRAFT":
      return (
        <div className="flex items-center justify-end gap-1">
          {edit("Edit release details")}
          <Button
            variant="primary"
            size="xs"
            leftIcon={<Rocket className="size-3" />}
            onClick={() => openDialog({ kind: "release", release })}
          >
            Deploy
          </Button>
          {remove}
        </div>
      );
    case "ROLLING_OUT":
      return (
        <div className="flex items-center justify-end gap-1">
          {edit("Edit release notes")}
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<Gauge className="size-3" />}
            onClick={() =>
              openDialog({
                kind: "rollout",
                release,
                percent: release.rolloutPercent,
              })
            }
          >
            Traffic %
          </Button>
          <Button
            variant="primary"
            size="xs"
            leftIcon={<Rocket className="size-3" />}
            onClick={() => openDialog({ kind: "release", release })}
          >
            100% Prod
          </Button>
          <Button
            variant="danger-soft"
            size="xs"
            leftIcon={<ArrowDownLeft className="size-3" />}
            onClick={() => openDialog({ kind: "rollback", release })}
          >
            Rollback
          </Button>
          {remove}
        </div>
      );
    case "RELEASED":
      return (
        <div className="flex items-center justify-end gap-1">
          {edit("Edit website changelog")}
          <Button
            variant="danger-soft"
            size="xs"
            leftIcon={<Undo2 className="size-3" />}
            onClick={() => openDialog({ kind: "rollback", release })}
          >
            Rollback
          </Button>
          {remove}
        </div>
      );
    case "ROLLED_BACK":
      return (
        <div className="flex items-center justify-end gap-1">
          {edit("Inspect release")}
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<Rocket className="size-3" />}
            onClick={() => openDialog({ kind: "release", release })}
          >
            Re-Deploy
          </Button>
          {remove}
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-end gap-1">{remove}</div>
      );
  }
};

export const ReleasesSection = () => {
  const {
    state,
    releases,
    summary,
    canManage,
    setChannelFilter,
    setStatusFilter,
    setSearch,
    setPage,
    openDialog,
  } = useVersioningContext();

  const [searchInput, setSearchInput] = React.useState(state.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const desktopTotal = summary?.byApp?.DESKTOP ?? releases.length;

  const hasFilters =
    Boolean(state.search) ||
    state.channelFilter !== "ALL" ||
    state.statusFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setChannelFilter("ALL");
    setStatusFilter("ALL");
  };

  const columns: Column<ReleaseListItem>[] = [
    {
      key: "release",
      header: "Version & Build",
      accessor: (row) => (
        <div className="flex items-center gap-2.5 min-w-[220px]">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
            <Laptop className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-[var(--gy-primary)] bg-[var(--gy-primary)]/10 px-2 py-0.5 rounded">
                v{row.version}
              </span>
              {row.isMandatory && (
                <Chip size="xs" variant="warning">
                  Mandatory
                </Chip>
              )}
              {row.showOnHome && (
                <Chip size="xs" variant="soft">
                  Website
                </Chip>
              )}
            </div>
            <div className="truncate text-xs font-medium text-[var(--gy-text)] mt-0.5">
              {row.title}
            </div>
            {row.summary && (
              <div className="truncate text-[11px] text-[var(--gy-text-subtle)]">
                {row.summary}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      width: "130px",
      accessor: (row) => (
        <Chip
          size="xs"
          variant={CHANNEL_META[row.channel].variant}
          className="whitespace-nowrap"
        >
          {CHANNEL_META[row.channel].label}
        </Chip>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "140px",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === "RELEASED" && (
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          )}
          <Chip
            size="xs"
            variant={STATUS_META[row.status].variant}
            className="whitespace-nowrap"
          >
            {STATUS_META[row.status].label}
          </Chip>
        </div>
      ),
    },
    {
      key: "rollout",
      header: "Rollout",
      width: "180px",
      accessor: (row) => <RolloutCell release={row} />,
    },
    {
      key: "created",
      header: "Deployed By / Date",
      width: "180px",
      accessor: (row) => (
        <div className="min-w-0 text-xs" title={formatDateTime(row.createdAt)}>
          <div className="truncate text-[var(--gy-text)] font-medium">
            {row.createdBy?.fullName ?? "System CI/CD"}
          </div>
          <div className="text-[var(--gy-text-subtle)] text-[11px]">
            {row.releasedAt
              ? `Released ${formatDate(row.releasedAt)}`
              : formatDate(row.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "240px",
      align: "right",
      accessor: (row) => <ReleaseActions release={row} />,
    },
  ];

  return (
    <Card variant="glass" radius="lg" padding="md" className="space-y-4">
      {/* Top Header & Search/Filter Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text)"
            className="text-base tracking-tight"
          >
            Desktop Release History
          </Typography>
          <Typography
            variant="small"
            textColor="var(--gy-text-secondary)"
            className="text-xs"
          >
            Changelog, rollout progression, and build artifacts for the Simantrix Desktop application.
          </Typography>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-56">
            <Input
              size="xs"
              placeholder="Search version, title..."
              leftIcon={<Search className="size-3.5 text-[var(--gy-text-subtle)]" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              clearable={Boolean(searchInput)}
              onClear={() => {
                setSearchInput("");
                setSearch("");
              }}
            />
          </div>

          <div className="w-40">
            <Dropdown
              size="xs"
              options={STATUS_OPTIONS}
              value={state.statusFilter}
              onChange={(v: string) => setStatusFilter(v as StatusFilter)}
              aria-label="Filter by status"
            />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<RotateCcw className="size-2.5" />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          )}

          {canManage && (
            <Button
              variant="primary"
              size="xs"
              leftIcon={<Plus className="size-3" />}
              onClick={() =>
                openDialog({ kind: "create", defaultApp: "DESKTOP" })
              }
            >
              New Release
            </Button>
          )}
        </div>
      </div>

      {/* Channel Navigation Tabs */}
      <div className="overflow-x-auto border-b border-[var(--gy-border)]/50 pb-2">
        <Tabs
          items={CHANNEL_TABS}
          activeTab={state.channelFilter}
          onTabChange={(id) => setChannelFilter(id as ChannelFilter)}
          variant="button"
          size="sm"
        />
      </div>

      {/* Table Content or Empty State */}
      {releases.length === 0 ? (
        <div className="py-4">
          <SectionEmpty
            icon={<Laptop className="size-6 text-[var(--gy-text-subtle)]" />}
            title={
              hasFilters
                ? "No desktop releases match your filters"
                : "No desktop releases published yet"
            }
            description={
              hasFilters
                ? "Try clearing your search query or channel filter to view more releases."
                : "Package and deploy the first Simantrix Desktop build to start managing Electron client versions."
            }
          />
          <div className="flex justify-center -mt-4 mb-4">
            {hasFilters ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            ) : canManage ? (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-3.5" />}
                onClick={() =>
                  openDialog({ kind: "create", defaultApp: "DESKTOP" })
                }
              >
                Create First Desktop Release
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table<ReleaseListItem>
              columns={columns}
              data={releases}
              rowKey={(row) => row.id}
              hoverable
              size="sm"
              isLoading={state.releasesLoading}
              pagination={tablePagination(state.releases?.meta)}
              onPageChange={setPage}
            />
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="lg:hidden space-y-3">
            {releases.map((item) => (
              <Card
                key={item.id}
                variant="glass"
                radius="lg"
                padding="sm"
                className="space-y-3 border border-[var(--gy-border)]/60"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
                      <Laptop className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[var(--gy-primary)] bg-[var(--gy-primary)]/10 px-2 py-0.5 rounded">
                          v{item.version}
                        </span>
                        {item.isMandatory && (
                          <Chip size="xs" variant="warning">
                            Mandatory
                          </Chip>
                        )}
                        {item.showOnHome && (
                          <Chip size="xs" variant="soft">
                            Website
                          </Chip>
                        )}
                      </div>
                      <span className="text-xs text-[var(--gy-text-subtle)] block mt-0.5">
                        {item.title}
                      </span>
                    </div>
                  </div>

                  <Chip
                    size="xs"
                    variant={STATUS_META[item.status].variant}
                  >
                    {STATUS_META[item.status].label}
                  </Chip>
                </div>

                {/* Rollout & Channel row */}
                <div className="grid grid-cols-2 gap-2 border-t border-[var(--gy-border)]/40 pt-2 text-xs">
                  <div>
                    <span className="text-[11px] text-[var(--gy-text-subtle)] block">
                      Channel
                    </span>
                    <Chip
                      size="xs"
                      variant={CHANNEL_META[item.channel].variant}
                      className="mt-0.5"
                    >
                      {CHANNEL_META[item.channel].label}
                    </Chip>
                  </div>

                  <div>
                    <span className="text-[11px] text-[var(--gy-text-subtle)] block">
                      Rollout
                    </span>
                    <div className="mt-1">
                      <RolloutCell release={item} />
                    </div>
                  </div>
                </div>

                {/* Footer with date and actions */}
                <div className="flex items-center justify-between border-t border-[var(--gy-border)]/40 pt-2 text-xs">
                  <span className="text-[11px] text-[var(--gy-text-subtle)]">
                    {item.releasedAt
                      ? `Released ${formatDate(item.releasedAt)}`
                      : formatDate(item.createdAt)}
                  </span>
                  <ReleaseActions release={item} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default ReleasesSection;
