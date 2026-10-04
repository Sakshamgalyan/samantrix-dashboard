"use client";

import {
  Button,
  Chip,
  Dropdown,
  ProgressBar,
  Table,
  Tabs,
  Tooltip,
  type Column,
} from "@galyan/ui";
import {
  Gauge,
  Pencil,
  Plus,
  Rocket,
  Tag,
  Trash2,
  Undo2,
} from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import { formatDate, formatDateTime } from "@/lib/format";
import { APP_META, CHANNEL_META, STATUS_META } from "../common/constants";
import { useVersioningContext } from "../context";
import {
  RELEASE_APPS,
  RELEASE_CHANNELS,
  RELEASE_STATUSES,
  type AppFilter,
  type ChannelFilter,
  type Release,
  type StatusFilter,
} from "../types";

const CHANNEL_OPTIONS = [
  { value: "ALL", label: "All channels" },
  ...RELEASE_CHANNELS.map((c) => ({ value: c, label: CHANNEL_META[c].label })),
];
const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  ...RELEASE_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label })),
];

function RolloutCell({ release }: { release: Release }) {
  if (release.status === "DRAFT") {
    return (
      <span className="text-xs text-[var(--gy-text-subtle)]">Not started</span>
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
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-[var(--gy-text-secondary)]">
        {release.rolloutPercent}%
      </span>
    </div>
  );
}

function ReleaseActions({ release }: { release: Release }) {
  const { openDialog, canManage } = useVersioningContext();
  if (!canManage) return null;

  switch (release.status) {
    case "DRAFT":
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip content="Edit draft" position="top" size="sm">
            <Button
              variant="glass"
              size="xs"
              aria-label="Edit draft"
              onClick={() => openDialog({ kind: "edit", release })}
            >
              <Pencil className="size-3" />
            </Button>
          </Tooltip>
          <Button
            variant="glass"
            size="xs"
            leftIcon={<Gauge className="size-3" />}
            onClick={() => openDialog({ kind: "rollout", release, percent: 10 })}
          >
            Roll out
          </Button>
          <Button
            variant="primary"
            size="xs"
            leftIcon={<Rocket className="size-3" />}
            onClick={() => openDialog({ kind: "release", release })}
          >
            Release
          </Button>
          <Tooltip content="Delete draft" position="top" size="sm">
            <Button
              variant="danger-soft"
              size="xs"
              aria-label="Delete draft"
              onClick={() => openDialog({ kind: "delete", release })}
            >
              <Trash2 className="size-3" />
            </Button>
          </Tooltip>
        </div>
      );
    case "ROLLING_OUT":
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="glass"
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
            Adjust
          </Button>
          <Button
            variant="primary"
            size="xs"
            leftIcon={<Rocket className="size-3" />}
            onClick={() => openDialog({ kind: "release", release })}
          >
            Release
          </Button>
          <Tooltip content="Roll back" position="top" size="sm">
            <Button
              variant="danger-soft"
              size="xs"
              aria-label="Roll back"
              onClick={() => openDialog({ kind: "rollback", release })}
            >
              <Undo2 className="size-3" />
            </Button>
          </Tooltip>
        </div>
      );
    case "RELEASED":
      return (
        <div className="flex justify-end">
          <Button
            variant="danger-soft"
            size="xs"
            leftIcon={<Undo2 className="size-3" />}
            onClick={() => openDialog({ kind: "rollback", release })}
          >
            Roll back
          </Button>
        </div>
      );
    default:
      return (
        <span className="block text-right text-xs text-[var(--gy-text-subtle)]">
          Final
        </span>
      );
  }
}

const columns: Column<Release>[] = [
  {
    key: "release",
    header: "Release",
    accessor: (row) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--gy-text)]">
            {APP_META[row.app].label}
          </span>
          <span className="font-mono text-sm text-[var(--gy-primary)]">
            {row.version}
          </span>
          {row.isMandatory && (
            <Chip size="sm" variant="warning" className="whitespace-nowrap">
              Mandatory
            </Chip>
          )}
        </div>
        <div className="truncate text-xs text-[var(--gy-text-secondary)]">
          {row.title}
        </div>
      </div>
    ),
  },
  {
    key: "channel",
    header: "Channel",
    width: "100px",
    accessor: (row) => (
      <Chip
        size="sm"
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
    width: "120px",
    accessor: (row) => (
      <Chip
        size="sm"
        variant={STATUS_META[row.status].variant}
        className="whitespace-nowrap"
      >
        {STATUS_META[row.status].label}
      </Chip>
    ),
  },
  {
    key: "rollout",
    header: "Rollout",
    width: "150px",
    accessor: (row) => <RolloutCell release={row} />,
  },
  {
    key: "created",
    header: "Created",
    width: "150px",
    accessor: (row) => (
      <div className="min-w-0 text-xs" title={formatDateTime(row.createdAt)}>
        <div className="truncate text-[var(--gy-text)]">
          {row.createdBy?.fullName ?? "Deleted user"}
        </div>
        <div className="text-[var(--gy-text-subtle)]">
          {row.releasedAt
            ? `Released ${formatDate(row.releasedAt)}`
            : formatDate(row.createdAt)}
        </div>
      </div>
    ),
  },
  {
    key: "actions",
    header: "",
    width: "260px",
    align: "right",
    accessor: (row) => <ReleaseActions release={row} />,
  },
];

export function ReleasesSection() {
  const {
    state,
    releases,
    visibleReleases,
    canManage,
    setAppFilter,
    setChannelFilter,
    setStatusFilter,
    openDialog,
  } = useVersioningContext();

  const countFor = (app: AppFilter) =>
    app === "ALL" ? releases.length : releases.filter((r) => r.app === app).length;

  const tabs = [
    { id: "ALL", label: `All · ${countFor("ALL")}` },
    ...RELEASE_APPS.map((app) => ({
      id: app,
      label: `${APP_META[app].label} · ${countFor(app)}`,
    })),
  ];

  return (
    <GlassSection
      title="Releases"
      subtitle="Every tracked version, newest first"
      aside={
        releases.length > 0 && (
          <>
            <div className="w-40">
              <Dropdown
                variant="glass"
                size="sm"
                options={CHANNEL_OPTIONS}
                value={state.channelFilter}
                onChange={(v: string) => setChannelFilter(v as ChannelFilter)}
                aria-label="Filter by channel"
              />
            </div>
            <div className="w-40">
              <Dropdown
                variant="glass"
                size="sm"
                options={STATUS_OPTIONS}
                value={state.statusFilter}
                onChange={(v: string) => setStatusFilter(v as StatusFilter)}
                aria-label="Filter by status"
              />
            </div>
          </>
        )
      }
    >
      {releases.length === 0 ? (
        <div>
          <SectionEmpty
            icon={<Tag className="size-5" />}
            title="No releases yet"
            description="Create a draft release for any Samantrix app, then roll it out gradually or release it to everyone."
          />
          {canManage && (
            <div className="-mt-4 flex justify-center pb-4">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-3.5" />}
                onClick={() => openDialog({ kind: "create" })}
              >
                New release
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <Tabs
              items={tabs}
              activeTab={state.appFilter}
              onTabChange={(id) => setAppFilter(id as AppFilter)}
              variant="button"
              size="sm"
            />
          </div>
          <div className="overflow-x-auto">
            <Table<Release>
              columns={columns}
              data={visibleReleases}
              rowKey={(row) => row.id}
              hoverable
              size="md"
              emptyStateLabel="No releases match"
              emptyStateMessage="Try another app, channel or status."
            />
          </div>
        </div>
      )}
    </GlassSection>
  );
}
