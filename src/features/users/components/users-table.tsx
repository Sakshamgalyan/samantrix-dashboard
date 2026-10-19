"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Table,
  Column,
  Input,
  Dropdown,
  Typography,
} from "@galyan/ui";
import { Search, Trash2, Users, SlidersHorizontal, RotateCcw } from "lucide-react";
import { tablePagination } from "@/features/common/pagination";
import type { TeamMemberRecord } from "@/features/users/types/api";
import {
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/features/users/types/api";
import { useUsersContext } from "@/features/users/context";

export function UsersTable() {
  const {
    state,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setPage,
    openSettingsDialog,
    openRemoveDialog,
  } = useUsersContext();

  const {
    members,
    meta,
    loading,
    search,
    roleFilter,
    statusFilter,
    presenceMap,
    onlineUserIds,
    currentUser,
    canManageTeam,
  } = state;

  const hasFilters =
    Boolean(search.trim()) ||
    roleFilter !== "ALL" ||
    statusFilter !== "ALL";

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const columns: Column<TeamMemberRecord>[] = [
    {
      key: "fullName",
      header: "Team member",
      accessor: (row) => {
        const isCurrent = row.userId === currentUser?.id;
        const live = presenceMap[row.userId];
        const isOnline = live
          ? live.status === "ONLINE"
          : onlineUserIds.includes(row.userId);

        return (
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)] text-xs font-bold text-[var(--gy-primary-fg)]">
                {(row.fullName || "User").slice(0, 2).toUpperCase()}
              </div>
              <span
                aria-label={isOnline ? "Online" : "Offline"}
                className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-[var(--gy-surface)] ${
                  isOnline
                    ? "bg-[var(--gy-success)]"
                    : "bg-[var(--gy-border-strong)]"
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm truncate">
                  {row.fullName || "Unnamed User"}
                </Typography>
                {isCurrent && (
                  <Chip variant="soft" size="xs">
                    You
                  </Chip>
                )}
              </div>
              <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs block">
                {row.email}
              </Typography>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Workspace role",
      accessor: (row) => (
        <Chip
          variant={
            row.role === "OWNER"
              ? "solid"
              : row.role === "ADMIN"
                ? "warning"
                : row.role === "MANAGER"
                  ? "primary"
                  : "soft"
          }
          size="sm"
        >
          {row.role}
        </Chip>
      ),
    },
    {
      key: "status",
      header: "Access status",
      accessor: (row) => {
        const isCurrent = row.userId === currentUser?.id;
        const isMemberOwner = row.role === "OWNER";
        const isEditable = canManageTeam && !isCurrent && !isMemberOwner;

        if (!isEditable) {
          return (
            <Chip
              variant={row.status === "ACTIVE" ? "success" : "danger"}
              size="sm"
            >
              {row.status}
            </Chip>
          );
        }

        return (
          <button
            type="button"
            onClick={() => openSettingsDialog(row)}
            className="group inline-flex cursor-pointer items-center transition-all hover:scale-105 active:scale-95"
            title="Click to open settings and change status"
          >
            <Chip
              variant={row.status === "ACTIVE" ? "success" : "danger"}
              size="sm"
              className="cursor-pointer group-hover:ring-2 group-hover:ring-[var(--gy-primary)] group-hover:ring-offset-1"
            >
              {row.status}
            </Chip>
          </button>
        );
      },
    },
    {
      key: "joinedAt",
      header: "Member since",
      accessor: (row) => (
        <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
          {new Date(row.joinedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Typography>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      headerAlign: "right",
      accessor: (row) => {
        const isCurrent = row.userId === currentUser?.id;
        const isMemberOwner = row.role === "OWNER";

        if (!canManageTeam || isCurrent || isMemberOwner) {
          return (
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              Protected
            </Typography>
          );
        }

        const name = row.fullName || "Member";
        return (
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <Button
              variant="secondary"
              size="xs"
              leftIcon={<SlidersHorizontal className="size-3" />}
              onClick={() => openSettingsDialog(row)}
            >
              Settings
            </Button>

            <Button
              variant="danger-soft"
              size="xs"
              leftIcon={<Trash2 className="size-3" />}
              aria-label={`Remove ${name}`}
              onClick={() => openRemoveDialog({ id: row.id, name })}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card variant="elevated" radius="xl" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs">
      <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
        <div className="flex w-full flex-col justify-between gap-3.5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h4" weight="semibold" textColor="var(--gy-text)" className="text-base tracking-tight">
                Team directory
              </Typography>
              <Chip variant="soft" size="xs">
                {meta?.total ?? members.length} members
              </Chip>
            </div>
            <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm">
              Everyone in the organization with their workspace role and access status.
            </Typography>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="w-full sm:w-60">
              <Input
                size="sm"
                type="text"
                placeholder="Search name or email..."
                aria-label="Search team members"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="size-3.5" />}
                clearable={Boolean(search)}
                onClear={() => setSearch("")}
                fullWidth
              />
            </div>
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
              <div className="w-full sm:w-36">
                <Dropdown
                  size="sm"
                  options={ROLE_FILTER_OPTIONS}
                  value={roleFilter}
                  onChange={(val) => setRoleFilter(val)}
                />
              </div>
              <div className="w-full sm:w-36">
                <Dropdown
                  size="sm"
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                />
              </div>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="size-3" />}
                onClick={resetFilters}
                className="shrink-0"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 pt-4">
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <Table<TeamMemberRecord>
            columns={columns}
            data={members}
            rowKey={(row) => row.id}
            hoverable
            size="md"
            isLoading={loading}
            skeletonRows={4}
            pagination={tablePagination(meta)}
            onPageChange={setPage}
            emptyStateLabel={
              hasFilters ? "No team members found" : "No team members yet"
            }
            emptyStateMessage={
              hasFilters
                ? "Try adjusting the search or filters."
                : "Invite teammates to start building your organization."
            }
            emptyStateIcon={<Users className="size-6" />}
          />
        </div>
      </CardBody>
    </Card>
  );
}
