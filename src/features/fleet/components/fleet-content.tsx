"use client";

import React, { useCallback, useMemo } from "react";
import {
  AnimatedNumber,
  Avatar,
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  ProgressBar,
  Skeleton,
  Typography,
  useToast,
} from "@galyan/ui";
import {
  Activity,
  AppWindow,
  Cpu,
  Globe,
  Laptop,
  LogOut,
  RotateCw,
  Search,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import { useDebounce } from "@/hooks/use-debounce";
import { DeleteModal } from "@/components/common/delete-modal";
import { useFleet } from "../context";
import {
  closeRevokeModalAction,
  openRevokeModalAction,
  resetFiltersAction,
  setActionErrorAction,
  setClientTypeFilterAction,
  setIsRevokingAction,
  setSearchQueryAction,
} from "../context/action";
import {
  useGetOrgFleetSessionsQuery,
  useRevokeFleetSessionMutation,
} from "../context/api";
import type { ClientFilterType } from "../types/state";
import type { OrgFleetSession } from "../types/api";

const ICON_TILE = "grid size-8 sm:size-9 place-items-center rounded-xl shrink-0";

export const FleetContent = () => {
  const { isOwner, isAdmin, user } = useAuth();
  const canManage = isOwner || isAdmin || user?.platformRole === "SUPERADMIN";
  const { toast } = useToast();

  const { state, dispatch } = useFleet();
  const { searchQuery, clientTypeFilter, actionError, revokingSession, isRevoking } = state;

  const debouncedSearch = useDebounce(searchQuery, 250);

  const fleetQuery = useGetOrgFleetSessionsQuery();
  const { data: rawSessions = [], isLoading, isFetching, refetch } = fleetQuery;
  const [revokeSession] = useRevokeFleetSessionMutation();

  const loadError = fleetQuery.error
    ? queryErrorMessage(fleetQuery.error, "Failed to load active fleet sessions.")
    : null;
  const error = actionError ?? loadError;

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return rawSessions.filter((session) => {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesUser = session.fullName.toLowerCase().includes(q);
        const matchesEmail = session.email.toLowerCase().includes(q);
        const matchesDevice = session.deviceName.toLowerCase().includes(q);
        const matchesOs = session.os.toLowerCase().includes(q);
        const matchesIp = session.ipAddress.toLowerCase().includes(q);
        if (!matchesUser && !matchesEmail && !matchesDevice && !matchesOs && !matchesIp) {
          return false;
        }
      }

      if (clientTypeFilter !== "ALL") {
        if (session.clientType !== clientTypeFilter) return false;
      }

      return true;
    });
  }, [rawSessions, debouncedSearch, clientTypeFilter]);

  // Statistics calculation
  const totalSessions = rawSessions.length;
  const desktopSessionsCount = rawSessions.filter((s) => s.clientType === "DESKTOP" || s.isDesktopApp).length;
  const browserSessionsCount = rawSessions.filter((s) => s.clientType === "BROWSER").length;
  const mobileSessionsCount = rawSessions.filter((s) => s.clientType === "MOBILE").length;

  const desktopRatio = totalSessions > 0 ? Math.round((desktopSessionsCount / totalSessions) * 100) : 0;
  const browserRatio = totalSessions > 0 ? Math.round((browserSessionsCount / totalSessions) * 100) : 0;
  const mobileRatio = totalSessions > 0 ? Math.round((mobileSessionsCount / totalSessions) * 100) : 0;

  const handleConfirmRevoke = useCallback(async () => {
    if (!revokingSession) return;
    dispatch(setIsRevokingAction(true));
    try {
      await revokeSession(revokingSession.id).unwrap();
      toast.success(
        `Session on '${revokingSession.deviceName}' for ${revokingSession.fullName} was revoked.`
      );
      dispatch(closeRevokeModalAction());
    } catch (err) {
      const msg = queryErrorMessage(err, "Failed to revoke session.");
      dispatch(setActionErrorAction(msg));
      toast.error(msg);
      dispatch(setIsRevokingAction(false));
    }
  }, [revokingSession, revokeSession, dispatch, toast]);

  const getClientIcon = (clientType: string) => {
    switch (clientType) {
      case "DESKTOP":
        return <Laptop className="size-3.5 text-[var(--gy-primary)]" />;
      case "MOBILE":
        return <Smartphone className="size-3.5 text-[var(--gy-success)]" />;
      case "BROWSER":
      default:
        return <Globe className="size-3.5 text-[var(--gy-info,#3b82f6)]" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Elevated Hero Header */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm" icon={<Cpu className="size-3" />}>
                Fleet Telemetry
              </Chip>
              <Chip variant="neutral" size="sm">
                {totalSessions} active sessions
              </Chip>
              <Chip variant="primary" size="sm">
                {desktopSessionsCount} desktop clients
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Desktop Fleet &amp; Active Sessions
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Monitor registered Simantrix Electron desktop apps, active browser instances, client operating systems, and terminate remote access in real time.
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
          </div>
        </div>
      </Card>

      {/* Global Error Banner */}
      {error && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          title="Session Management Notice"
          description={error}
        />
      )}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Active Sessions */}
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
              Total Sessions
            </Typography>
            <div className={`${ICON_TILE} bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]`}>
              <Activity className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-text)]">
              {isLoading ? <Skeleton className="h-6 w-12" /> : <AnimatedNumber value={totalSessions} />}
            </div>
            <Chip variant="soft" size="xs">
              Live
            </Chip>
          </div>
          <div className="mt-2.5">
            <ProgressBar progress={100} variant="primary" size="sm" showLabel={false} />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block truncate">
            Concurrent connected tokens
          </Typography>
        </Card>

        {/* KPI 2: Desktop Electron Apps */}
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
              Desktop Electron Apps
            </Typography>
            <div className={`${ICON_TILE} bg-[var(--gy-info,#3b82f6)]/10 text-[var(--gy-info,#3b82f6)]`}>
              <AppWindow className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-info,#3b82f6)]">
              {isLoading ? <Skeleton className="h-6 w-12" /> : <AnimatedNumber value={desktopSessionsCount} />}
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              ({desktopRatio}%)
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-[var(--gy-info,#3b82f6)] transition-all duration-500"
              style={{ width: `${desktopRatio}%` }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block truncate">
            Simantrix native client apps
          </Typography>
        </Card>

        {/* KPI 3: Web Browsers */}
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
              Web Browsers
            </Typography>
            <div className={`${ICON_TILE} bg-[var(--gy-warning)]/10 text-[var(--gy-warning)]`}>
              <Globe className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-warning)]">
              {isLoading ? <Skeleton className="h-6 w-12" /> : <AnimatedNumber value={browserSessionsCount} />}
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              ({browserRatio}%)
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-[var(--gy-warning)] transition-all duration-500"
              style={{ width: `${browserRatio}%` }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block truncate">
            Chrome, Edge, Safari, Firefox
          </Typography>
        </Card>

        {/* KPI 4: Mobile Clients */}
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
              Mobile Clients
            </Typography>
            <div className={`${ICON_TILE} bg-[var(--gy-success)]/10 text-[var(--gy-success)]`}>
              <Smartphone className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--gy-success)]">
              {isLoading ? <Skeleton className="h-6 w-12" /> : <AnimatedNumber value={mobileSessionsCount} />}
            </div>
            <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
              ({mobileRatio}%)
            </Typography>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--gy-surface-sunken)] overflow-hidden">
            <div
              className="h-full bg-[var(--gy-success)] transition-all duration-500"
              style={{ width: `${mobileRatio}%` }}
            />
          </div>
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-2 text-xs block truncate">
            iOS and Android browsers
          </Typography>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-80">
            <Input
              size="sm"
              leftIcon={<Search className="size-4" />}
              placeholder="Search user, device, OS, IP address..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQueryAction(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
            {(
              [
                { id: "ALL", label: "All Sessions", count: totalSessions },
                { id: "DESKTOP", label: "Desktop App", count: desktopSessionsCount },
                { id: "BROWSER", label: "Web Browser", count: browserSessionsCount },
                { id: "MOBILE", label: "Mobile", count: mobileSessionsCount },
              ] as const
            ).map((filter) => {
              const active = clientTypeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => dispatch(setClientTypeFilterAction(filter.id as ClientFilterType))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-[var(--gy-primary)] text-[var(--gy-primary-contrast,#ffffff)] shadow-xs"
                      : "bg-[var(--gy-surface-sunken)] border border-[var(--gy-border)] text-[var(--gy-text-secondary)] hover:text-[var(--gy-text)] hover:border-[var(--gy-border-hover)]"
                  }`}
                >
                  <Typography variant="span" weight="medium" className="text-xs">
                    {filter.label}
                  </Typography>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? "bg-white/20 text-white" : "bg-[var(--gy-border)] text-[var(--gy-text-subtle)]"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, idx) => (
            <Card
              key={idx}
              variant="elevated"
              radius="xl"
              padding="md"
              className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card
          variant="elevated"
          radius="xl"
          padding="lg"
          className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
        >
          <EmptyState
            variant="glass"
            size="sm"
            title="No Active Sessions Found"
            description={
              searchQuery || clientTypeFilter !== "ALL"
                ? "No device sessions match the selected search query or client type filter."
                : "There are currently no active desktop or browser sessions for your organization."
            }
            action={
              searchQuery || clientTypeFilter !== "ALL" ? (
                <Button variant="secondary" size="sm" onClick={() => dispatch(resetFiltersAction())}>
                  Reset Filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              variant="elevated"
              radius="xl"
              padding="md"
              className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Column: User details and device */}
              <div className="flex items-start gap-3.5 min-w-0">
                <Avatar
                  name={session.fullName}
                  src={session.avatarUrl ?? undefined}
                  size="md"
                />

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Typography variant="h3" weight="bold" textColor="var(--gy-text)" className="text-sm">
                      {session.fullName}
                    </Typography>
                    <Chip size="xs" variant="neutral">
                      {session.role}
                    </Chip>
                    {session.department && (
                      <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs">
                        • {session.department}
                      </Typography>
                    )}
                  </div>

                  <Typography variant="p" textColor="var(--gy-text-subtle)" className="text-xs truncate">
                    {session.email}
                  </Typography>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 rounded-lg bg-[var(--gy-surface-sunken)] px-2 py-0.5 border border-[var(--gy-border)]">
                      {getClientIcon(session.clientType)}
                      <Typography variant="span" weight="medium" textColor="var(--gy-text)" className="font-mono text-xs">
                        {session.deviceName}
                      </Typography>
                    </div>
                    <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs">
                      •
                    </Typography>
                    <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-xs">
                      {session.os}
                    </Typography>
                    <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs">
                      •
                    </Typography>
                    <Typography variant="span" textColor="var(--gy-text-subtle)" className="font-mono text-xs">
                      {session.ipAddress}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Right Column: Connection Timestamps and Revoke Button */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--gy-border)] w-full sm:w-auto">
                <div className="text-left sm:text-right space-y-0.5 text-xs text-[var(--gy-text-subtle)]">
                  <Typography variant="p" textColor="var(--gy-text-secondary)" className="text-xs">
                    Last seen:{" "}
                    <Typography variant="span" weight="medium" textColor="var(--gy-text)" className="text-xs font-mono">
                      {new Date(session.lastSeenAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Typography>
                  <Typography variant="p" textColor="var(--gy-text-subtle)" className="text-[11px]">
                    Signed in:{" "}
                    <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-[11px]">
                      {new Date(session.loginAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography>
                  </Typography>
                </div>

                {canManage && (
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<LogOut className="size-3.5" />}
                    onClick={() => dispatch(openRevokeModalAction(session))}
                    className="shrink-0"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Revoke Session Confirmation Modal */}
      {revokingSession && (
        <DeleteModal
          isOpen={revokingSession !== null}
          onClose={() => dispatch(closeRevokeModalAction())}
          onConfirm={handleConfirmRevoke}
          title="Revoke Device Session"
          itemName={revokingSession.deviceName}
          itemType="device session"
          confirmText="Revoke Access"
          isDeleting={isRevoking}
          loadingText="Revoking..."
          icon={
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--gy-danger-soft,#fee2e2)] text-[var(--gy-danger,#ef4444)]">
              <ShieldAlert className="size-4 shrink-0" />
            </div>
          }
          warningMessage="Terminating this session will immediately log out the user from this device and invalidate their access tokens."
          description={`Are you sure you want to terminate the active session for ${revokingSession.fullName} on ${revokingSession.deviceName} (${revokingSession.ipAddress})?`}
        />
      )}
    </div>
  );
};
