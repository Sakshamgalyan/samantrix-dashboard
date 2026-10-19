"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  AnimatedNumber,
  Avatar,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Column,
  EmptyState,
  Input,
  ProgressBar,
  Skeleton,
  Table,
  Typography,
} from "@galyan/ui";
import {
  Crown,
  Edit2,
  Layers,
  Network,
  RotateCcw,
  RotateCw,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import { useDebounce } from "@/hooks/use-debounce";
import { useDepartments } from "../context";
import {
  openReassignModalAction,
  resetFiltersAction,
  setSearchQueryAction,
  setSelectedDepartmentAction,
} from "../context/action";
import { useGetOrgDepartmentsQuery } from "../context/api";
import { getDepartmentMeta } from "../common/constants";
import { DepartmentCard } from "./department-card";
import { ReassignModal } from "./reassign-modal";
import type { DepartmentMember } from "../types/api";

const ICON_TILE = "grid size-8 sm:size-9 place-items-center rounded-xl shrink-0";

export function DepartmentsContent() {
  const { isOwner, isAdmin, user } = useAuth();
  const canEdit = isOwner || isAdmin || user?.platformRole === "SUPERADMIN";

  const { state, dispatch } = useDepartments();
  const { searchQuery, selectedDepartment, actionError } = state;

  const debouncedSearch = useDebounce(searchQuery, 250);

  const departmentsQuery = useGetOrgDepartmentsQuery();
  const { refetch, isLoading, isFetching } = departmentsQuery;
  const departments = departmentsQuery.data ?? [];

  const loadError = departmentsQuery.error
    ? queryErrorMessage(departmentsQuery.error, "Failed to load departments.")
    : null;
  const error = actionError ?? loadError;

  // Statistics calculation
  const totalDepartments = departments.length;
  const totalAssignedMembers = departments
    .filter((d) => d.name !== "General / Unassigned")
    .reduce((acc, d) => acc + d.memberCount, 0);
  const leadsCount = departments.filter((d) => Boolean(d.lead)).length;
  const unassignedCount =
    departments.find((d) => d.name === "General / Unassigned")?.memberCount ?? 0;
  const totalMembers = totalAssignedMembers + unassignedCount;
  const assignedPercentage =
    totalMembers > 0
      ? Math.round((totalAssignedMembers / totalMembers) * 100)
      : 0;

  // Filter departments based on search query
  const filteredDepartments = useMemo(() => {
    if (!debouncedSearch.trim()) return departments;
    const q = debouncedSearch.toLowerCase().trim();
    return departments.filter((d) => {
      const matchesName = d.name.toLowerCase().includes(q);
      const matchesLead = d.lead?.fullName.toLowerCase().includes(q);
      const matchesMember = d.members.some(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.jobTitle && m.jobTitle.toLowerCase().includes(q)),
      );
      return matchesName || matchesLead || matchesMember;
    });
  }, [departments, debouncedSearch]);

  // Selected department details
  const activeDepartment = useMemo(() => {
    if (!selectedDepartment) return departments[0] ?? null;
    return departments.find((d) => d.name === selectedDepartment) ?? null;
  }, [departments, selectedDepartment]);

  const activeDepartmentMeta = activeDepartment
    ? getDepartmentMeta(activeDepartment.name)
    : null;
  const ActiveDepartmentIcon = activeDepartmentMeta?.icon ?? Layers;

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedDepartment !== null;

  // Table columns for the selected department roster
  const columns: Column<DepartmentMember>[] = useMemo(() => {
    return [
      {
        key: "fullName",
        header: "Team member",
        accessor: (row) => {
          const isCurrent = row.userId === user?.id;
          return (
            <div className="flex items-center gap-3">
              <Avatar
                size="sm"
                name={row.fullName}
                src={row.avatarUrl}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Typography
                    variant="span"
                    weight="semibold"
                    textColor="var(--gy-text)"
                    className="text-sm truncate"
                  >
                    {row.fullName || "Unnamed User"}
                  </Typography>
                  {isCurrent && (
                    <Chip variant="soft" size="xs">
                      You
                    </Chip>
                  )}
                </div>
                <Typography
                  variant="small"
                  textColor="var(--gy-text-secondary)"
                  className="truncate text-xs block"
                >
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
        key: "jobTitle",
        header: "Job title",
        accessor: (row) =>
          row.jobTitle ? (
            <Typography variant="small" textColor="var(--gy-text)" className="text-xs">
              {row.jobTitle}
            </Typography>
          ) : (
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs italic">
              Not specified
            </Typography>
          ),
      },
      {
        key: "status",
        header: "Status",
        accessor: (row) => (
          <Chip
            variant={row.status === "ACTIVE" ? "success" : "danger"}
            size="sm"
          >
            {row.status}
          </Chip>
        ),
      },
      ...(canEdit
        ? [
            {
              key: "actions",
              header: "Actions",
              align: "right" as const,
              headerAlign: "right" as const,
              accessor: (row: DepartmentMember) => (
                <div className="flex items-center justify-end">
                  <Button
                    variant="secondary"
                    size="xs"
                    leftIcon={<Edit2 className="size-3" />}
                    onClick={() => dispatch(openReassignModalAction(row))}
                  >
                    Reassign
                  </Button>
                </div>
              ),
            },
          ]
        : []),
    ];
  }, [user?.id, canEdit, dispatch]);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          title="Departments operation error"
          description={error}
          button={
            <Button variant="danger-soft" size="xs" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Hero Header */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm">
                Team structure &amp; hierarchy
              </Chip>
              <Chip variant="neutral" size="sm">
                {totalDepartments} departments
              </Chip>
              <Chip variant="primary" size="sm">
                {totalAssignedMembers} mapped seats
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Departments &amp; Team Hierarchy
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Organize team members by discipline, designate department leads, and manage
              organizational structure across your digital workplace.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />}
              disabled={isFetching}
              onClick={() => void refetch()}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              href="/organization/users"
              as={Link}
              leftIcon={<UserPlus className="size-3.5" />}
              className="flex-1 sm:flex-initial"
            >
              Invite teammate
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Departments */}
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text-secondary)"
              className="text-xs uppercase tracking-wider truncate"
            >
              Departments
            </Typography>
            <div className={`${ICON_TILE} bg-indigo-500/10 text-indigo-500`}>
              <Network className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
              <AnimatedNumber value={totalDepartments} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              units
            </Typography>
          </div>
          <div className="mt-2.5">
            <ProgressBar
              progress={100}
              variant="primary"
              size="sm"
              showLabel={false}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Active organizational units
          </Typography>
        </Card>

        {/* Metric 2: Assigned Headcount */}
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text-secondary)"
              className="text-xs uppercase tracking-wider truncate"
            >
              Assigned Headcount
            </Typography>
            <div className={`${ICON_TILE} bg-emerald-500/10 text-emerald-500`}>
              <UserCheck className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">
              <AnimatedNumber value={totalAssignedMembers} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              / {totalMembers} seats
            </Typography>
          </div>
          <div className="mt-2.5">
            <ProgressBar
              progress={assignedPercentage}
              variant="success"
              size="sm"
              showLabel={false}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            {assignedPercentage}% assigned to teams
          </Typography>
        </Card>

        {/* Metric 3: Department Leads */}
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text-secondary)"
              className="text-xs uppercase tracking-wider truncate"
            >
              Department Leads
            </Typography>
            <div className={`${ICON_TILE} bg-amber-500/10 text-amber-500`}>
              <Crown className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600">
              <AnimatedNumber value={leadsCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              appointed
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (leadsCount / (totalDepartments || 1)) * 100,
                )}%`,
              }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Designated team leaders
          </Typography>
        </Card>

        {/* Metric 4: Unassigned Pool */}
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <Typography
              variant="label"
              weight="medium"
              textColor="var(--gy-text-secondary)"
              className="text-xs uppercase tracking-wider truncate"
            >
              Unassigned Pool
            </Typography>
            <div className={`${ICON_TILE} bg-purple-500/10 text-purple-500`}>
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600">
              <AnimatedNumber value={unassignedCount} />
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              members
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (unassignedCount / (totalMembers || 1)) * 100,
                )}%`,
              }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block">
            Pending department mapping
          </Typography>
        </Card>
      </div>

      {/* Search & Quick Filter Bar */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full sm:w-72 lg:w-80">
            <Input
              size="sm"
              leftIcon={<Search className="size-3.5" />}
              placeholder="Search departments or members..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQueryAction(e.target.value))}
              clearable={Boolean(searchQuery)}
              onClear={() => dispatch(setSearchQueryAction(""))}
              fullWidth
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Typography
              variant="span"
              textColor="var(--gy-text-subtle)"
              className="mr-1 text-xs shrink-0 hidden sm:inline"
            >
              Focus View:
            </Typography>
            <Chip
              size="sm"
              clickable
              selected={selectedDepartment === null}
              variant={selectedDepartment === null ? "primary" : "neutral"}
              icon={<Layers className="size-3" />}
              onClick={() => dispatch(setSelectedDepartmentAction(null))}
              className="shrink-0"
            >
              All Departments
            </Chip>
            {departments.slice(0, 6).map((d) => {
              const meta = getDepartmentMeta(d.name);
              const IconComp = meta.icon;
              const isSelected = selectedDepartment === d.name;
              return (
                <Chip
                  key={d.name}
                  size="sm"
                  clickable
                  selected={isSelected}
                  variant={isSelected ? "primary" : "neutral"}
                  icon={<IconComp className="size-3" />}
                  onClick={() => dispatch(setSelectedDepartmentAction(d.name))}
                  className="shrink-0"
                >
                  {d.name} ({d.memberCount})
                </Chip>
              );
            })}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(resetFiltersAction())}
                leftIcon={<RotateCcw className="size-3" />}
                className="shrink-0 ml-1"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Departments Grid Area */}
      {isLoading && departments.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="200px" className="rounded-xl" />
          ))}
        </div>
      ) : filteredDepartments.length === 0 ? (
        <EmptyState
          variant="glass"
          size="sm"
          title="No departments found"
          description="We couldn't find any department matching your search."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(resetFiltersAction())}
              leftIcon={<RotateCcw className="size-3" />}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredDepartments.map((dept) => (
            <DepartmentCard
              key={dept.name}
              department={dept}
              isSelected={selectedDepartment === dept.name}
              onSelect={(name) =>
                dispatch(
                  setSelectedDepartmentAction(
                    selectedDepartment === name ? null : name,
                  ),
                )
              }
            />
          ))}
        </div>
      )}

      {/* Selected Department Drill-Down Roster */}
      {activeDepartment && (
        <Card
          variant="elevated"
          radius="xl"
          padding="md"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
        >
          <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)] shrink-0">
                  <ActiveDepartmentIcon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Typography
                      variant="h4"
                      weight="semibold"
                      textColor="var(--gy-text)"
                      className="text-base tracking-tight"
                    >
                      {activeDepartment.name} Team Roster
                    </Typography>
                    <Chip size="xs" variant="soft">
                      {activeDepartment.members.length} members
                    </Chip>
                  </div>
                  <Typography
                    variant="small"
                    textColor="var(--gy-text-secondary)"
                    className="text-xs sm:text-sm mt-0.5"
                  >
                    Team members assigned to this department with workspace roles and job titles.
                  </Typography>
                </div>
              </div>

              {canEdit && (
                <Typography
                  variant="small"
                  textColor="var(--gy-text-subtle)"
                  className="text-xs shrink-0"
                >
                  Click Reassign to adjust department or title
                </Typography>
              )}
            </div>
          </CardHeader>

          <CardBody className="p-0 pt-4">
            {activeDepartment.members.length === 0 ? (
              <EmptyState
                variant="glass"
                size="sm"
                title={`No members currently in ${activeDepartment.name}`}
                description="Assign team members to this department from the Team Members directory."
              />
            ) : (
              <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                <Table<DepartmentMember>
                  columns={columns}
                  data={activeDepartment.members}
                  rowKey={(row) => row.id}
                  hoverable
                  size="md"
                  emptyStateLabel={`No members in ${activeDepartment.name}`}
                />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Department Reassign Modal */}
      <ReassignModal />
    </div>
  );
}
