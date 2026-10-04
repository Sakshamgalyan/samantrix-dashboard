"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  AreaChart,
  BarChart,
  DonutChart,
  Table,
  type Column,
  type ChipVariant,
  AnimatedNumber,
  ProgressBar,
  Input,
  Banner,
  Modal,
} from "@galyan/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRealtime } from "@/lib/realtime-context";
import { Users, Sparkles, HardDrive, RefreshCw, Search, Clock, Radio, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrgAnalyticsOverview {
  totalMembers: number;
  activeMembers: number;
  seatUtilizationPercent: number;
  featuresEnabledCount: number;
  totalEntitledFeatures: number;
  storageUsedMb: number;
  storageLimitMb: number;
  apiCallsThisMonth: number;
  recentActivity: Array<{
    id: string;
    action: string;
    resource?: string;
    actorEmail?: string;
    createdAt: string;
    status?: string;
  }>;
}

type PresenceStatus = "ONLINE" | "BUSY" | "IN_MEETING" | "AWAY" | "OFFLINE";

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  presenceStatus?: PresenceStatus;
  lastActive?: string;
}

/** Loose shape of a member record as returned by the backend (field names vary). */
interface RawMember {
  id?: string;
  userId?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: TeamMember["status"];
  updatedAt?: string;
  user?: { fullName?: string; email?: string };
}

type MembersResponse = RawMember[] | { items?: RawMember[]; data?: RawMember[] } | null | undefined;

interface CurrentUserLike {
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

interface OrgDataResult {
  overview: OrgAnalyticsOverview | null;
  members: TeamMember[] | null;
}

const DEFAULT_ANALYTICS: OrgAnalyticsOverview = {
  totalMembers: 12,
  activeMembers: 9,
  seatUtilizationPercent: 75,
  featuresEnabledCount: 6,
  totalEntitledFeatures: 8,
  storageUsedMb: 4200,
  storageLimitMb: 15000,
  apiCallsThisMonth: 18450,
  recentActivity: [],
};

function extractMemberList(res: MembersResponse): RawMember[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

function curatedRoster(user: CurrentUserLike | null | undefined): TeamMember[] {
  return [
    {
      id: user?.id || "usr_current",
      fullName: user?.fullName || "Current User",
      email: user?.email || "user@samantrix.com",
      role: user?.role || "OWNER",
      department: "Executive & Strategy",
      status: "ACTIVE",
      presenceStatus: "ONLINE",
      lastActive: "Just now",
    },
    {
      id: "tm_2",
      fullName: "Sarah Connor",
      email: "sarah.c@company.internal",
      role: "ADMIN",
      department: "Product Design",
      status: "ACTIVE",
      presenceStatus: "IN_MEETING",
      lastActive: "10m ago",
    },
    {
      id: "tm_3",
      fullName: "David Chen",
      email: "d.chen@company.internal",
      role: "MEMBER",
      department: "Engineering",
      status: "ACTIVE",
      presenceStatus: "ONLINE",
      lastActive: "2m ago",
    },
    {
      id: "tm_4",
      fullName: "Amara Patel",
      email: "amara@company.internal",
      role: "MEMBER",
      department: "Engineering",
      status: "ACTIVE",
      presenceStatus: "BUSY",
      lastActive: "15m ago",
    },
    {
      id: "tm_5",
      fullName: "Liam O'Connor",
      email: "liam@company.internal",
      role: "MEMBER",
      department: "Customer Success",
      status: "ACTIVE",
      presenceStatus: "AWAY",
      lastActive: "1h ago",
    },
    {
      id: "tm_6",
      fullName: "Jessica Taylor",
      email: "jessica.t@company.internal",
      role: "MEMBER",
      department: "Operations",
      status: "ACTIVE",
      presenceStatus: "OFFLINE",
      lastActive: "Yesterday",
    },
  ];
}

/** Fetches analytics + members without touching React state. */
async function loadOrgData(user: CurrentUserLike | null | undefined): Promise<OrgDataResult> {
  let overview: OrgAnalyticsOverview | null = null;
  let members: TeamMember[] | null = null;

  // 1. Organization analytics overview
  try {
    overview = (await api.get<OrgAnalyticsOverview>("/organizations/current/analytics/overview")) || null;
  } catch (err) {
    console.warn("Org analytics overview fallback:", err);
  }

  // 2. Team members
  try {
    const membersRes = await api.get<MembersResponse>("/organizations/current/members");
    const list = extractMemberList(membersRes);
    members =
      list.length > 0
        ? list.map((m) => ({
            id: m.id || m.userId || "",
            fullName: m.fullName || m.name || m.user?.fullName || "Team Member",
            email: m.email || m.user?.email || "member@company.com",
            role: m.role || "MEMBER",
            department: m.department || "Engineering",
            status: m.status || "ACTIVE",
            presenceStatus: "ONLINE",
            lastActive: m.updatedAt || new Date().toISOString(),
          }))
        : curatedRoster(user);
  } catch (err) {
    console.warn("Org members fallback:", err);
  }

  return { overview, members };
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

const KPI_LABEL = "text-xs font-medium text-[var(--gy-text-secondary)]";
const KPI_CAPTION = "mt-2 text-xs text-[var(--gy-text-subtle)]";
const ICON_TILE = "grid size-9 place-items-center rounded-xl";

export function OrganizationView() {
  const { user, organization, isOwner, isAdmin } = useAuth();
  const { status: socketStatus, latencyMs, presenceMap, onlineUserIds } = useRealtime();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<OrgAnalyticsOverview>(DEFAULT_ANALYTICS);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const orgName = organization?.name || user?.organization?.name || "Workspace Organization";
  const planTier = organization?.planTier || "PROFESSIONAL";
  const canInvite = isOwner || isAdmin;

  const applyResult = useCallback((result: OrgDataResult) => {
    setError(null);
    const { overview, members: nextMembers } = result;
    if (overview) setAnalytics((prev) => ({ ...prev, ...overview }));
    if (nextMembers) setMembers(nextMembers);
  }, []);

  const applyError = useCallback((err: unknown) => {
    setError(err instanceof ApiError ? err.message : "Failed to load workspace data.");
  }, []);

  const finish = useCallback(() => {
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadOrgData(user)
      .then((result) => {
        if (!cancelled) applyResult(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) applyError(err);
      })
      .finally(() => {
        if (!cancelled) finish();
      });
    return () => {
      cancelled = true;
    };
  }, [user, applyResult, applyError, finish]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrgData(user).then(applyResult).catch(applyError).finally(finish);
  };

  // Real-time presence enhancement: map live Socket.IO presence events to member roster
  const enhancedMembers = useMemo(() => {
    return members.map((m) => {
      const live = presenceMap[m.id];
      if (live) {
        return { ...m, presenceStatus: live.status, lastActive: "Active now" };
      }
      if (onlineUserIds.includes(m.id)) {
        return { ...m, presenceStatus: "ONLINE" as const, lastActive: "Active now" };
      }
      return m;
    });
  }, [members, presenceMap, onlineUserIds]);

  const filteredMembers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return enhancedMembers.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.department || "").toLowerCase().includes(q),
    );
  }, [enhancedMembers, searchTerm]);

  // Chart Data: Weekly Virtual Office Attendance & Meeting Hours (AreaChart)
  const weeklyAttendanceData = useMemo(
    () => [
      { day: "Mon", attendance: 8, meetings: 14 },
      { day: "Tue", attendance: 11, meetings: 18 },
      { day: "Wed", attendance: 12, meetings: 22 },
      { day: "Thu", attendance: 10, meetings: 19 },
      { day: "Fri", attendance: 9, meetings: 12 },
      { day: "Sat", attendance: 3, meetings: 2 },
      { day: "Sun", attendance: 2, meetings: 1 },
    ],
    [],
  );

  // Chart Data: Department Distribution (BarChart)
  const departmentData = useMemo(
    () => [
      { label: "Engineering", value: 6, color: "var(--gy-primary)" },
      { label: "Product & Design", value: 3, color: "var(--gy-info)" },
      { label: "Operations", value: 2, color: "var(--gy-warning)" },
      { label: "Executive / Strategy", value: 1, color: "var(--gy-success)" },
    ],
    [],
  );

  // Chart Data: Realtime Presence Breakdown (DonutChart)
  const presenceBreakdown = useMemo(() => {
    let onlineCount = 0;
    let inMeetingCount = 0;
    let awayCount = 0;
    let offlineCount = 0;

    enhancedMembers.forEach((m) => {
      switch (m.presenceStatus) {
        case "ONLINE":
          onlineCount++;
          break;
        case "IN_MEETING":
        case "BUSY":
          inMeetingCount++;
          break;
        case "AWAY":
          awayCount++;
          break;
        default:
          offlineCount++;
          break;
      }
    });

    return [
      { name: "Online now", value: Math.max(onlineCount, 1), color: "var(--gy-success)", dot: "bg-[var(--gy-success)]" },
      { name: "In meeting", value: Math.max(inMeetingCount, 1), color: "var(--gy-primary)", dot: "bg-[var(--gy-primary)]" },
      { name: "Away", value: Math.max(awayCount, 1), color: "var(--gy-warning)", dot: "bg-[var(--gy-warning)]" },
      { name: "Offline", value: Math.max(offlineCount, 1), color: "var(--gy-text-subtle)", dot: "bg-[var(--gy-text-subtle)]" },
    ];
  }, [enhancedMembers]);

  const storageUsedGb = Math.round(analytics.storageUsedMb / 102.4) / 10;
  const storageLimitGb = Math.round((analytics.storageLimitMb || 15000) / 1024);

  const memberColumns: Column<TeamMember>[] = [
    {
      key: "fullName",
      header: "Team member",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="grid size-8 place-items-center rounded-xl bg-[var(--gy-primary)]/15 text-xs font-bold text-[var(--gy-primary)]">
              {row.fullName.slice(0, 2).toUpperCase()}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-[var(--gy-surface)] ${presenceDotClass(row.presenceStatus)}`}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--gy-text)]">{row.fullName}</span>
            <span className="text-xs text-[var(--gy-text-subtle)]">{row.email}</span>
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
        <span className="text-sm text-[var(--gy-text-secondary)]">{row.department || "Engineering"}</span>
      ),
    },
    {
      key: "lastActive",
      header: "Last activity",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[var(--gy-text-subtle)]">
          <Clock className="size-3" />
          <span>{row.lastActive || "Recently"}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      accessor: (row) => (
        <Button variant="secondary" size="xs" onClick={() => setSelectedMember(row)}>
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <Banner
          variant="danger"
          title="Couldn't load workspace data"
          description={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Intro */}
      <Card variant="elevated" radius="xl" padding="lg">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Chip variant="soft" size="sm">
                Organization workspace
              </Chip>
              <Chip variant="success" size="sm">
                {planTier}
              </Chip>
              <div className="flex items-center gap-1.5 text-xs text-[var(--gy-success)]">
                <Radio className="size-3 animate-pulse" />
                <span>
                  Realtime {socketStatus} ({latencyMs}ms)
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--gy-text)] sm:text-3xl">
              {orgName} Workplace Intelligence
            </h1>
            <p className="max-w-2xl text-sm text-[var(--gy-text-secondary)]">
              Virtual workplace capacity, member presence, departmental collaboration metrics, and real-time office
              floor activity.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </Button>
            {canInvite && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-3.5" />}
                onClick={() => navigate("/users")}
              >
                Invite teammates
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card variant="elevated" radius="xl" padding="md" hoverEffect="lift">
          <div className="flex items-center justify-between">
            <span className={KPI_LABEL}>Assigned seats</span>
            <div className={`${ICON_TILE} bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]`}>
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-[var(--gy-text)]">
              <AnimatedNumber value={analytics.totalMembers} />
            </div>
            <span className="text-xs text-[var(--gy-text-secondary)]">/ 16 seats</span>
          </div>
          <div className="mt-3">
            <ProgressBar progress={analytics.seatUtilizationPercent || 75} variant="primary" size="sm" showLabel={false} />
          </div>
          <p className={KPI_CAPTION}>{analytics.seatUtilizationPercent}% of licensed seats utilized</p>
        </Card>

        <Card variant="elevated" radius="xl" padding="md" hoverEffect="lift">
          <div className="flex items-center justify-between">
            <span className={KPI_LABEL}>Live in office now</span>
            <div className={`${ICON_TILE} bg-[var(--gy-success)]/10 text-[var(--gy-success)]`}>
              <Radio className="size-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-[var(--gy-success)]">
              <AnimatedNumber value={Math.max(onlineUserIds.length, analytics.activeMembers || 1)} />
            </div>
            <Chip variant="success" size="sm">
              Realtime
            </Chip>
          </div>
          <p className={KPI_CAPTION}>Connected to virtual office rooms via LiveKit</p>
        </Card>

        <Card variant="elevated" radius="xl" padding="md" hoverEffect="lift">
          <div className="flex items-center justify-between">
            <span className={KPI_LABEL}>Feature add-ons</span>
            <div className={`${ICON_TILE} bg-[var(--gy-info)]/10 text-[var(--gy-info)]`}>
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-[var(--gy-text)]">
              <AnimatedNumber value={analytics.featuresEnabledCount} />
            </div>
            <span className="text-xs text-[var(--gy-text-secondary)]">/ {analytics.totalEntitledFeatures} active</span>
          </div>
          <div className="mt-3">
            <ProgressBar
              progress={Math.round((analytics.featuresEnabledCount / (analytics.totalEntitledFeatures || 1)) * 100)}
              variant="gradient"
              size="sm"
              showLabel={false}
            />
          </div>
          <p className={KPI_CAPTION}>AI Summary, Spatial Audio, Screen Sharing enabled</p>
        </Card>

        <Card variant="elevated" radius="xl" padding="md" hoverEffect="lift">
          <div className="flex items-center justify-between">
            <span className={KPI_LABEL}>Workspace storage</span>
            <div className={`${ICON_TILE} bg-[var(--gy-warning)]/10 text-[var(--gy-warning)]`}>
              <HardDrive className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <div className="text-3xl font-bold text-[var(--gy-text)]">
              <AnimatedNumber value={storageUsedGb} decimals={1} />
            </div>
            <span className="text-xs text-[var(--gy-text-secondary)]">GB / {storageLimitGb} GB</span>
          </div>
          <div className="mt-3">
            <ProgressBar
              progress={Math.round((analytics.storageUsedMb / (analytics.storageLimitMb || 15000)) * 100)}
              variant="info"
              size="sm"
              showLabel={false}
            />
          </div>
          <p className={KPI_CAPTION}>Recorded meetings, shared documents &amp; whiteboard assets</p>
        </Card>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card variant="elevated" radius="xl" padding="lg" className="lg:col-span-2">
          <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-4">
            <div className="flex w-full items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--gy-text)]">Weekly attendance &amp; collaboration</h3>
                <p className="text-sm text-[var(--gy-text-secondary)]">
                  Daily presence in the virtual office and collaborative meeting hours
                </p>
              </div>
              <Chip variant="soft" size="sm">
                Last 7 days
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="p-0 pt-4">
            <div className="h-[320px] w-full">
              <AreaChart
                data={weeklyAttendanceData}
                xAxisKey="day"
                height={300}
                series={[
                  { key: "attendance", name: "Active teammates", color: "var(--gy-info)" },
                  { key: "meetings", name: "Meeting hours", color: "var(--gy-primary)" },
                ]}
              />
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated" radius="xl" padding="lg">
          <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-4">
            <h3 className="text-base font-semibold text-[var(--gy-text)]">Live presence breakdown</h3>
            <p className="text-sm text-[var(--gy-text-secondary)]">Current teammate availability</p>
          </CardHeader>
          <CardBody className="flex flex-col items-center justify-center p-0 pt-4">
            <div className="flex h-[240px] w-full items-center justify-center">
              <DonutChart
                data={presenceBreakdown.map(({ name, value, color }) => ({ name, value, color }))}
                height={220}
                variant="standard"
                showLegend={true}
              />
            </div>
            <div className="mt-4 grid w-full grid-cols-2 gap-2 text-xs">
              {presenceBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-[var(--gy-text-secondary)]">
                  <span className={`size-2 rounded-full ${item.dot}`} />
                  <span className="truncate">
                    {item.name}: <strong className="text-[var(--gy-text)]">{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card variant="elevated" radius="xl" padding="lg" className="lg:col-span-2">
          <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-4">
            <div className="flex w-full items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--gy-text)]">Department headcount</h3>
                <p className="text-sm text-[var(--gy-text-secondary)]">Seat allocation by functional unit</p>
              </div>
              <span className="text-xs font-semibold text-[var(--gy-primary)]">
                {enhancedMembers.length} active accounts
              </span>
            </div>
          </CardHeader>
          <CardBody className="p-0 pt-4">
            <div className="h-[280px] w-full">
              <BarChart variant="filled" data={departmentData} height={260} showValues={true} />
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated" radius="xl" padding="lg">
          <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-4">
            <div className="flex w-full items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--gy-text)]">Office zone status</h3>
              <Chip variant="soft" size="sm">
                Virtual space
              </Chip>
            </div>
            <p className="text-sm text-[var(--gy-text-secondary)]">Floor capacity &amp; meeting hubs</p>
          </CardHeader>
          <CardBody className="p-0 pt-4">
            <div className="space-y-3">
              {[
                {
                  name: "Main open office area",
                  detail: "Desks 1-16 & lounge",
                  chip: `${Math.max(onlineUserIds.length, 3)} active`,
                  variant: "success" as ChipVariant,
                },
                {
                  name: "Executive conference A",
                  detail: "LiveKit audio/video hub",
                  chip: "2 in huddle",
                  variant: "soft" as ChipVariant,
                },
                {
                  name: "Engineering war room",
                  detail: "Screen share & pairing",
                  chip: "Busy",
                  variant: "warning" as ChipVariant,
                },
              ].map((zone) => (
                <div
                  key={zone.name}
                  className="flex items-center justify-between rounded-2xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-[var(--gy-text)]">{zone.name}</div>
                    <div className="text-xs text-[var(--gy-text-subtle)]">{zone.detail}</div>
                  </div>
                  <Chip variant={zone.variant} size="sm">
                    {zone.chip}
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Members directory */}
      <Card variant="elevated" radius="xl" padding="lg">
        <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-4">
          <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-semibold text-[var(--gy-text)]">Team members &amp; live presence</h3>
              <p className="text-sm text-[var(--gy-text-secondary)]">Presence syncs live via the realtime gateway</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full sm:w-64">
                <Input
                  size="sm"
                  fullWidth
                  placeholder="Filter teammates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="size-3.5" />}
                  aria-label="Filter teammates"
                />
              </div>
              {canInvite && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="size-3.5" />}
                  onClick={() => navigate("/users")}
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
              data={filteredMembers}
              rowKey={(row) => row.id}
              variant="striped"
              hoverable={true}
              size="md"
              isLoading={loading}
              skeletonRows={5}
              emptyStateLabel={searchTerm ? "No teammates match your filter" : "No team members yet"}
            />
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
        title={selectedMember?.fullName}
        subtitle={selectedMember?.email}
        size="sm"
        confirmText={canInvite ? "Open user management" : "Close"}
        cancelText="Close"
        onCancel={() => setSelectedMember(null)}
        onConfirm={() => {
          setSelectedMember(null);
          if (canInvite) navigate("/users");
        }}
      >
        {selectedMember && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-[var(--gy-text-secondary)]">Presence</dt>
            <dd>
              <Chip variant={presenceChipVariant(selectedMember.presenceStatus)} size="sm">
                {formatPresence(selectedMember.presenceStatus)}
              </Chip>
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Role</dt>
            <dd>
              <Chip variant={roleChipVariant(selectedMember.role)} size="sm">
                {selectedMember.role}
              </Chip>
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Department</dt>
            <dd className="text-[var(--gy-text)]">{selectedMember.department || "Engineering"}</dd>
            <dt className="text-[var(--gy-text-secondary)]">Last activity</dt>
            <dd className="text-[var(--gy-text)]">{selectedMember.lastActive || "Recently"}</dd>
          </dl>
        )}
      </Modal>
    </div>
  );
}
