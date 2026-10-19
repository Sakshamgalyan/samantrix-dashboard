"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Table,
  Input,
  Typography,
  type Column,
  type ChipVariant,
} from "@galyan/ui";
import { Search, Plus, Clock } from "lucide-react";
import { tablePagination } from "@/features/common/pagination";
import type { TeamMember, PresenceStatus } from "@/features/overview/types";
import type { PaginationMeta } from "@/features/common/pagination";

export interface OrganizationMembersTableProps {
  members: TeamMember[];
  loading: boolean;
  searchTerm: string;
  meta?: PaginationMeta;
  canInvite: boolean;
  onSearchChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onSelectMember: (member: TeamMember) => void;
}

function presenceDotClass(status?: PresenceStatus): string {
  switch (status) {
    case "ONLINE":
      return "bg-[var(--gy-success)]";
    case "IN_MEETING":
    case "BUSY":
      return "bg-[var(--gy-primary)]";
    case "AWAY":
      return "bg-[var(--gy-warning)]";
    default:
      return "bg-[var(--gy-text-subtle)]";
  }
}

function presenceChipVariant(status?: PresenceStatus): ChipVariant {
  switch (status) {
    case "ONLINE":
      return "success";
    case "IN_MEETING":
    case "BUSY":
      return "soft";
    case "AWAY":
      return "warning";
    default:
      return "neutral";
  }
}

function roleChipVariant(role: string): ChipVariant {
  if (role === "OWNER") return "danger";
  if (role === "ADMIN") return "warning";
  return "soft";
}

function formatPresence(status?: PresenceStatus): string {
  return (status || "OFFLINE").replace("_", " ");
}

export function OrganizationMembersTable({
  members,
  loading,
  searchTerm,
  meta,
  canInvite,
  onSearchChange,
  onPageChange,
  onSelectMember,
}: OrganizationMembersTableProps) {
  const router = useRouter();

  const memberColumns: Column<TeamMember>[] = [
    {
      key: "fullName",
      header: "Team member",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="grid size-8 place-items-center rounded-xl bg-[var(--gy-primary)]/15 text-xs font-bold text-[var(--gy-primary)]">
              {row.fullName.slice(0, 2).toUpperCase()}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-[var(--gy-surface)] ${presenceDotClass(row.presenceStatus)}`}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm truncate">
              {row.fullName}
            </Typography>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs truncate">
              {row.email}
            </Typography>
          </div>
        </div>
      ),
    },
    {
      key: "presenceStatus",
      header: "Presence",
      accessor: (row) => (
        <Chip variant={presenceChipVariant(row.presenceStatus)} size="sm">
          {formatPresence(row.presenceStatus)}
        </Chip>
      ),
    },
    {
      key: "role",
      header: "Role",
      accessor: (row) => (
        <Chip variant={roleChipVariant(row.role)} size="sm">
          {row.role}
        </Chip>
      ),
    },
    {
      key: "department",
      header: "Department",
      accessor: (row) => (
        <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-sm">
          {row.department || "Engineering"}
        </Typography>
      ),
    },
    {
      key: "lastActive",
      header: "Last activity",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[var(--gy-text-subtle)]">
          <Clock className="size-3 shrink-0" />
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
            {row.lastActive || "Recently"}
          </Typography>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      accessor: (row) => (
        <Button variant="secondary" size="xs" onClick={() => onSelectMember(row)}>
          Manage
        </Button>
      ),
    },
  ];

  return (
    <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs">
      <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
        <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h4" weight="semibold" textColor="var(--gy-text)" className="text-base tracking-tight">
                Team members &amp; live presence
              </Typography>
              <Chip variant="soft" size="xs">
                {meta?.total ?? members.length} total
              </Chip>
            </div>
            <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm">
              Presence syncs live via the realtime gateway
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input
                size="sm"
                fullWidth
                placeholder="Filter teammates..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                leftIcon={<Search className="size-3.5" />}
                clearable={Boolean(searchTerm)}
                onClear={() => onSearchChange("")}
                aria-label="Filter teammates"
              />
            </div>
            {canInvite && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-3.5" />}
                onClick={() => router.push("/organization/users")}
                className="shrink-0"
              >
                Invite
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0 pt-4">
        <div className="overflow-x-auto">
          <Table<TeamMember>
            columns={memberColumns}
            data={members}
            rowKey={(row) => row.id}
            variant="striped"
            hoverable={true}
            size="md"
            isLoading={loading}
            skeletonRows={5}
            pagination={tablePagination(meta)}
            onPageChange={onPageChange}
            emptyStateLabel={searchTerm ? "No teammates match your filter" : "No team members yet"}
          />
        </div>
      </CardBody>
    </Card>
  );
}
