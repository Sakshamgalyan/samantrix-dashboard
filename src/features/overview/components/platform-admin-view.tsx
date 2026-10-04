"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatedNumber,
  AreaChart,
  Banner,
  BarChart,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  DonutChart,
  Dropdown,
  EmptyState,
  Input,
  Modal,
  Skeleton,
  Table,
  type ChipVariant,
  type Column,
} from "@galyan/ui";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  DollarSign,
  Globe,
  Radio,
  RefreshCw,
  Search,
  ServerCog,
  Users,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import {
  useRealtime,
  type RealtimeConnectionStatus,
} from "@/lib/realtime-context";

/** Shape of GET /analytics/platform-overview */
interface PlatformOverview {
  generatedAt: string;
  users: {
    total: number;
    newLast30d: number;
    newPrev30d: number;
    growthPercent: number | null;
    verified: number;
    twoFactor: number;
    byRole: { role: string; count: number }[];
    byType: { type: string; count: number }[];
  };
  organizations: {
    total: number;
    newLast30d: number;
    byStatus: { status: string; count: number }[];
  };
  revenue: { mrr: number; currency: string; payingOrganizations: number };
  sessions: { activeNow: number; signInsLast30d: number };
  leads: { waitlist: number; contact: number; pending: number };
  traffic: {
    visitsLast30d: number;
    channels: { label: string; count: number }[];
  };
  trend: { date: string; newUsers: number; signIns: number }[];
  services: { name: string; healthy: boolean; latencyMs: number }[];
  recentUsers: PlatformUser[];
}

interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  userType: "DEVELOPER" | "ORGANIZATION";
  platformRole: string;
  status: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  organization: { id: string; name: string } | null;
  orgRole: string | null;
}

const REFRESH_MS = 60_000;

const GATEWAY_STATUS: Record<
  RealtimeConnectionStatus,
  { label: string; variant: ChipVariant }
> = {
  connected: { label: "Gateway connected", variant: "success" },
  connecting: { label: "Gateway connecting", variant: "warning" },
  reconnecting: { label: "Gateway reconnecting", variant: "warning" },
  disconnected: { label: "Gateway offline", variant: "danger" },
  error: { label: "Gateway error", variant: "danger" },
};

const CHART_COLORS = [
  "var(--gy-primary)",
  "var(--gy-info)",
  "var(--gy-success)",
  "var(--gy-warning)",
  "var(--gy-secondary)",
  "var(--gy-danger)",
];

/** Inner rows that sit on glass cards. */
const GLASS_ROW =
  "rounded-xl border border-[color-mix(in_srgb,var(--gy-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--gy-surface)_45%,transparent)]";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDay = (isoDay: string) =>
  new Date(`${isoDay}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/** Platform roles in plain language (falls back to title case for anything new). */
const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  PLATFORM_ADMIN: "Platform admin",
  PLATFORM_SUPPORT: "Platform support",
  PLATFORM_BILLING: "Platform billing",
  REPORT_ADMIN: "Report admin",
  ORGS: "Organization accounts",
  USER: "Standard users",
};

const roleLabel = (role?: string | null) =>
  ROLE_LABELS[role || "USER"] ?? formatRole(role);

/** Singular wording for one person's role (table chips, inspect dialog). */
const SINGLE_ROLE_LABELS: Record<string, string> = { ORGS: "Organization", USER: "Standard" };
const userRoleLabel = (role?: string | null) =>
  SINGLE_ROLE_LABELS[role || "USER"] ?? roleLabel(role);

const formatRole = (role?: string | null) =>
  (role || "USER")
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

function SectionHeader({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle: string;
  aside?: React.ReactNode;
}) {
  return (
    <CardHeader className="border-b border-[color-mix(in_srgb,var(--gy-border)_60%,transparent)] p-0 pb-4">
      <div className="flex w-full items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--gy-text)]">
            {title}
          </h3>
          <p className="text-sm text-[var(--gy-text-secondary)]">{subtitle}</p>
        </div>
        {aside}
      </div>
    </CardHeader>
  );
}

interface KpiCardProps {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  badge?: React.ReactNode;
  description: string;
}

function KpiCard({ label, icon, value, badge, description }: KpiCardProps) {
  return (
    <Card variant="glass" radius="xl" padding="md" hoverEffect="lift">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--gy-text-secondary)]">
          {label}
        </span>
        <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)]/12 text-[var(--gy-primary)] ring-1 ring-[var(--gy-primary)]/20">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="text-3xl font-bold tracking-tight text-[var(--gy-text)]">
          {value}
        </div>
        {badge}
      </div>
      <p className="mt-2 text-xs text-[var(--gy-text-subtle)]">{description}</p>
    </Card>
  );
}

function GrowthBadge({
  added,
  percent,
}: {
  added: number;
  percent: number | null;
}) {
  if (added === 0)
    return (
      <Chip size="sm" variant="neutral">
        No new this month
      </Chip>
    );
  const down = percent !== null && percent < 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-semibold ${down ? "text-[var(--gy-danger)]" : "text-[var(--gy-success)]"}`}
      title={
        percent === null
          ? "No sign-ups in the previous 30 days to compare against"
          : "vs. previous 30 days"
      }
    >
      {down ? (
        <ArrowDownRight className="size-3.5" />
      ) : (
        <ArrowUpRight className="size-3.5" />
      )}
      +{added} this month
      {percent !== null && ` (${percent > 0 ? "+" : ""}${percent}%)`}
    </span>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton height="132px" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height="138px" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton height="380px" className="lg:col-span-2" />
        <Skeleton height="380px" />
      </div>
    </div>
  );
}

export function PlatformAdminView() {
  const { status: socketStatus, latencyMs, recentPackets } = useRealtime();

  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [inspectedUser, setInspectedUser] = useState<PlatformUser | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<PlatformOverview>(
        "/analytics/platform-overview",
      );
      setOverview(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load platform analytics.",
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    load();
  };

  const trendData = useMemo(
    () =>
      (overview?.trend ?? []).map((d) => ({
        label: formatDay(d.date),
        newUsers: d.newUsers,
        signIns: d.signIns,
      })),
    [overview],
  );

  const roleData = useMemo(
    () =>
      (overview?.users.byRole ?? [])
        .slice()
        .sort((a, b) => b.count - a.count)
        .map((r, i) => ({
          name: roleLabel(r.role),
          value: r.count,
          color: CHART_COLORS[i % CHART_COLORS.length],
        })),
    [overview],
  );

  const channelData = useMemo(
    () =>
      (overview?.traffic.channels ?? []).map((c, i) => ({
        label: c.label,
        value: c.count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [overview],
  );

  const roleOptions = useMemo(
    () => [
      { value: "ALL", label: "All roles" },
      ...(overview?.users.byRole ?? []).map((r) => ({
        value: r.role,
        label: roleLabel(r.role),
      })),
    ],
    [overview],
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (overview?.recentUsers ?? []).filter((u) => {
      const matchesSearch =
        !term ||
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.organization?.name ?? "").toLowerCase().includes(term);
      return (
        matchesSearch && (roleFilter === "ALL" || u.platformRole === roleFilter)
      );
    });
  }, [overview, searchTerm, roleFilter]);

  const userColumns: Column<PlatformUser>[] = [
    {
      key: "fullName",
      header: "User",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/12 text-xs font-semibold text-[var(--gy-primary)]">
            {row.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-[var(--gy-text)]">
              {row.fullName}
            </span>
            <span className="truncate text-xs text-[var(--gy-text-secondary)]">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "platformRole",
      header: "Access",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Chip
            size="sm"
            variant={
              row.platformRole === "SUPERADMIN"
                ? "danger"
                : row.platformRole === "PLATFORM_ADMIN"
                  ? "warning"
                  : "neutral"
            }
          >
            {userRoleLabel(row.platformRole)}
          </Chip>
          {row.userType === "DEVELOPER" && (
            <Chip size="sm" variant="soft">
              Developer
            </Chip>
          )}
        </div>
      ),
    },
    {
      key: "organization",
      header: "Organization",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Building2 className="size-3.5 shrink-0 text-[var(--gy-text-subtle)]" />
          <span className="max-w-[160px] truncate text-[var(--gy-text)]">
            {row.organization?.name ?? "Unassigned"}
          </span>
        </div>
      ),
    },
    {
      key: "security",
      header: "Security",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Chip variant={row.isEmailVerified ? "success" : "warning"} size="sm">
            {row.isEmailVerified ? "Verified" : "Unverified"}
          </Chip>
          {row.twoFactorEnabled && (
            <Chip variant="soft" size="sm">
              2FA
            </Chip>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      accessor: (row) => (
        <span className="text-xs text-[var(--gy-text-secondary)]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      accessor: (row) => (
        <Button variant="glass" size="xs" onClick={() => setInspectedUser(row)}>
          Inspect
        </Button>
      ),
    },
  ];

  if (!overview) {
    return error ? (
      <Card variant="glass" radius="xl" padding="lg">
        <EmptyState
          icon={<ServerCog className="size-6" />}
          title="Platform analytics unavailable"
          description={error}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RefreshCw className="size-3.5" />}
              onClick={refresh}
            >
              Try again
            </Button>
          }
        />
      </Card>
    ) : (
      <OverviewSkeleton />
    );
  }

  const { users, organizations, revenue, sessions, leads, traffic, services } =
    overview;
  const gateway = GATEWAY_STATUS[socketStatus] ?? GATEWAY_STATUS.disconnected;
  const healthyServices = services.filter((s) => s.healthy).length;
  const allHealthy = healthyServices === services.length;
  const orgStatusLine = organizations.byStatus
    .map((s) => `${s.count} ${s.status.toLowerCase()}`)
    .join(" · ");

  return (
    <div className="space-y-6">
      {error && (
        <Banner
          variant="warning"
          size="sm"
          bannerStyle="subtle"
          description={`Showing data from ${new Date(overview.generatedAt).toLocaleTimeString()}. Refresh failed: ${error}`}
        />
      )}

      {/* Hero */}
      <Card variant="glass" radius="xl" padding="lg">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm">
                Platform admin
              </Chip>
              <Chip variant={gateway.variant} size="sm">
                {socketStatus === "connected"
                  ? `${gateway.label} · ${latencyMs}ms`
                  : gateway.label}
              </Chip>
              <Chip variant={allHealthy ? "success" : "danger"} size="sm">
                {allHealthy
                  ? "All systems operational"
                  : `${services.length - healthyServices} service(s) down`}
              </Chip>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--gy-text)]">
              Ecosystem &amp; user analytics
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--gy-text-secondary)]">
              Live view of accounts, tenant workspaces, revenue and platform
              health. Updates every minute.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1.5 md:items-end">
            <Button
              variant="glass"
              size="sm"
              onClick={refresh}
              disabled={refreshing}
              leftIcon={
                <RefreshCw
                  className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
              }
            >
              Refresh
            </Button>
            <span className="text-[11px] text-[var(--gy-text-subtle)]">
              Updated{" "}
              {new Date(overview.generatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </Card>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Platform users"
          icon={<Users className="size-4" />}
          value={<AnimatedNumber value={users.total} />}
          badge={
            <GrowthBadge
              added={users.newLast30d}
              percent={users.growthPercent}
            />
          }
          description={`${users.verified} verified · ${users.twoFactor} with 2FA`}
        />
        <KpiCard
          label="Organizations"
          icon={<Building2 className="size-4" />}
          value={<AnimatedNumber value={organizations.total} />}
          badge={
            organizations.newLast30d > 0 ? (
              <Chip variant="success" size="sm">
                +{organizations.newLast30d} this month
              </Chip>
            ) : undefined
          }
          description={orgStatusLine || "No organizations yet"}
        />
        <KpiCard
          label="Monthly recurring revenue"
          icon={<DollarSign className="size-4" />}
          value={formatMoney(revenue.mrr, revenue.currency)}
          description={
            revenue.payingOrganizations > 0
              ? `${revenue.payingOrganizations} paying organization${revenue.payingOrganizations === 1 ? "" : "s"}`
              : "No paid subscriptions yet"
          }
        />
        <KpiCard
          label="Active sessions"
          icon={<Activity className="size-4" />}
          value={<AnimatedNumber value={sessions.activeNow} />}
          badge={
            sessions.activeNow > 0 ? (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--gy-success)] opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--gy-success)]" />
              </span>
            ) : undefined
          }
          description={`${sessions.signInsLast30d} sign-in${sessions.signInsLast30d === 1 ? "" : "s"} in the last 30 days`}
        />
      </div>

      {/* Trend + roles */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          variant="glass"
          radius="xl"
          padding="lg"
          className="lg:col-span-2"
        >
          <SectionHeader
            title="Sign-ups & sign-ins"
            subtitle="New accounts and sign-ins per day"
            aside={
              <Chip variant="neutral" size="sm">
                Last 30 days
              </Chip>
            }
          />
          <CardBody className="p-0 pt-4">
            <div className="h-[300px] w-full">
              <AreaChart
                data={trendData}
                xAxisKey="label"
                height={290}
                series={[
                  {
                    key: "newUsers",
                    name: "New accounts",
                    color: "var(--gy-primary)",
                  },
                  { key: "signIns", name: "Sign-ins", color: "var(--gy-info)" },
                ]}
              />
            </div>
          </CardBody>
        </Card>

        <Card variant="glass" radius="xl" padding="lg">
          <SectionHeader
            title="Accounts by role"
            subtitle={`${users.total} accounts across the platform`}
          />
          <CardBody className="flex flex-col items-center justify-center p-0 pt-4">
            {roleData.length === 0 ? (
              <EmptyState
                size="sm"
                variant="subtle"
                icon={<Users className="size-5" />}
                title="No accounts yet"
              />
            ) : (
              <div className="flex h-[240px] w-full items-center justify-center">
                <DonutChart
                  data={roleData}
                  height={220}
                  variant="standard"
                  showLegend
                />
              </div>
            )}
            <div className="mt-3 grid w-full grid-cols-2 gap-2">
              {users.byType.map((t) => (
                <div key={t.type} className={`${GLASS_ROW} px-3 py-2`}>
                  <div className="text-lg font-semibold text-[var(--gy-text)]">
                    {t.count}
                  </div>
                  <div className="text-xs text-[var(--gy-text-secondary)]">
                    {t.type === "DEVELOPER"
                      ? "Developers"
                      : "Organization users"}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Acquisition + health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          variant="glass"
          radius="xl"
          padding="lg"
          className="lg:col-span-2"
        >
          <SectionHeader
            title="Visitor acquisition"
            subtitle="Marketing-site visits by channel"
            aside={
              <div className="flex shrink-0 items-center gap-1.5 text-sm text-[var(--gy-text-secondary)]">
                <Globe className="size-3.5 text-[var(--gy-text-subtle)]" />
                <span>
                  {traffic.visitsLast30d.toLocaleString()} visits · 30d
                </span>
              </div>
            }
          />
          <CardBody className="p-0 pt-4">
            {channelData.length === 0 ? (
              <div className="py-10">
                <EmptyState
                  size="sm"
                  variant="subtle"
                  icon={<Globe className="size-5" />}
                  title="No visits recorded in the last 30 days"
                  description="Visits tracked by samantrix-home appear here, grouped by UTM source and referrer."
                />
              </div>
            ) : (
              <div className="h-[260px] w-full">
                <BarChart
                  variant="filled"
                  data={channelData}
                  height={250}
                  showValues
                />
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "Waitlist", value: leads.waitlist },
                { label: "Contact requests", value: leads.contact },
                { label: "Pending follow-up", value: leads.pending },
              ].map((l) => (
                <div key={l.label} className={`${GLASS_ROW} px-3 py-2`}>
                  <div className="text-lg font-semibold text-[var(--gy-text)]">
                    {l.value}
                  </div>
                  <div className="text-xs text-[var(--gy-text-secondary)]">
                    {l.label}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-6">
          <Card variant="glass" radius="xl" padding="lg">
            <SectionHeader
              title="System health"
              subtitle="Live dependency checks"
              aside={
                <Chip variant={allHealthy ? "success" : "danger"} size="sm">
                  {healthyServices}/{services.length} up
                </Chip>
              }
            />
            <CardBody className="space-y-2 p-0 pt-4">
              {services.map((s) => (
                <div
                  key={s.name}
                  className={`${GLASS_ROW} flex items-center justify-between px-3 py-2.5`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        background: s.healthy
                          ? "var(--gy-success)"
                          : "var(--gy-danger)",
                      }}
                    />
                    <span className="text-sm font-medium text-[var(--gy-text)]">
                      {s.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[var(--gy-text-subtle)]">
                    {s.healthy ? `${s.latencyMs} ms` : "unreachable"}
                  </span>
                </div>
              ))}
              <div
                className={`${GLASS_ROW} flex items-center justify-between px-3 py-2.5`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-2 rounded-full"
                    style={{
                      background:
                        socketStatus === "connected"
                          ? "var(--gy-success)"
                          : "var(--gy-warning)",
                    }}
                  />
                  <span className="text-sm font-medium text-[var(--gy-text)]">
                    Realtime gateway
                  </span>
                </div>
                <span className="font-mono text-xs text-[var(--gy-text-subtle)]">
                  {socketStatus === "connected"
                    ? `${latencyMs} ms`
                    : socketStatus}
                </span>
              </div>
            </CardBody>
          </Card>
          <Card variant="glass" radius="xl" padding="lg">
            <SectionHeader
              title="Gateway events"
              subtitle="Recent realtime WebSocket events"
              aside={
                socketStatus === "connected" ? (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--gy-success)] opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-[var(--gy-success)]" />
                  </span>
                ) : undefined
              }
            />
            <CardBody className="p-0 pt-4">
              {recentPackets.length === 0 ? (
                <EmptyState
                  size="sm"
                  variant="subtle"
                  icon={<Radio className="size-5" />}
                  title="No events yet"
                  description="Listening on the realtime gateway."
                />
              ) : (
                <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                  {recentPackets.slice(0, 6).map((pkt) => (
                    <div
                      key={pkt.id}
                      className={`${GLASS_ROW} flex items-center justify-between gap-2 px-3 py-2 text-sm`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="size-1.5 shrink-0 rounded-full bg-[var(--gy-primary)]" />
                        <span className="truncate font-mono text-xs text-[var(--gy-text)]">
                          {pkt.type}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-[var(--gy-text-subtle)]">
                        {new Date(pkt.timestamp).toLocaleTimeString([], {
                          hour12: false,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Newest accounts */}
      <div>
        <Card variant="glass" radius="xl" padding="lg">
          <CardHeader className="border-b border-[color-mix(in_srgb,var(--gy-border)_60%,transparent)] p-0 pb-4">
            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-semibold text-[var(--gy-text)]">
                  Newest accounts
                </h3>
                <p className="text-sm text-[var(--gy-text-secondary)]">
                  Latest {overview.recentUsers.length} sign-ups across all
                  tenants
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-56">
                  <Input
                    size="sm"
                    type="text"
                    placeholder="Filter by name, email, org…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="size-3.5" />}
                    aria-label="Filter accounts"
                    fullWidth
                  />
                </div>
                <div className="w-40">
                  <Dropdown
                    size="sm"
                    variant="glass"
                    options={roleOptions}
                    value={roleFilter}
                    onChange={setRoleFilter}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0 pt-4">
            <div className="overflow-x-auto">
              <Table<PlatformUser>
                columns={userColumns}
                data={filteredUsers}
                rowKey={(row) => row.id}
                hoverable
                size="md"
                emptyStateLabel="No accounts match your filters"
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal
        variant="glass"
        isOpen={inspectedUser !== null}
        onClose={() => setInspectedUser(null)}
        size="sm"
        title={inspectedUser?.fullName}
        subtitle={inspectedUser?.email}
        footer={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setInspectedUser(null)}
          >
            Close
          </Button>
        }
      >
        {inspectedUser && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-[var(--gy-text-secondary)]">User ID</dt>
            <dd className="break-all font-mono text-xs text-[var(--gy-text)]">
              {inspectedUser.id}
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Account type</dt>
            <dd className="text-[var(--gy-text)]">
              {inspectedUser.userType === "DEVELOPER"
                ? "Developer"
                : "Organization"}
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Status</dt>
            <dd className="text-[var(--gy-text)]">
              {formatRole(inspectedUser.status)}
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Platform role</dt>
            <dd className="text-[var(--gy-text)]">
              {userRoleLabel(inspectedUser.platformRole)}
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Organization</dt>
            <dd className="text-[var(--gy-text)]">
              {inspectedUser.organization
                ? `${inspectedUser.organization.name}${inspectedUser.orgRole ? ` (${formatRole(inspectedUser.orgRole)})` : ""}`
                : "Unassigned"}
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Email verified</dt>
            <dd className="text-[var(--gy-text)]">
              {inspectedUser.isEmailVerified ? "Yes" : "No"}
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Two-factor</dt>
            <dd className="text-[var(--gy-text)]">
              {inspectedUser.twoFactorEnabled ? "Enabled" : "Disabled"}
            </dd>
            <dt className="text-[var(--gy-text-secondary)]">Joined</dt>
            <dd className="text-[var(--gy-text)]">
              {formatDate(inspectedUser.createdAt)}
            </dd>
          </dl>
        )}
      </Modal>
    </div>
  );
}
