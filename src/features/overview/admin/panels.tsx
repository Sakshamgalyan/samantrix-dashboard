"use client";

import { memo } from "react";
import Link from "next/link";
import { AreaChart, Chip } from "@galyan/ui";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CircleDollarSign,
  Clock,
  Hourglass,
  Inbox,
  ServerCog,
  UserPlus,
  UserX,
} from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { formatNumber, relativeTime } from "@/utils/format";
import { money } from "@/features/payments/common/constants";
import type { AdminOverviewData } from "@/features/overview/admin/types";

// ── Small building blocks ───────────────────────────────────────────────

/** Percentage ring (0–100) with the value in the middle. */
export function Ring({ value, tone = "var(--gy-primary)", size = 44 }: { value: number | null; tone?: string; size?: number }) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value));
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} stroke="color-mix(in srgb, var(--gy-border) 70%, transparent)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={5}
          strokeLinecap="round"
          stroke={tone}
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute text-[11px] font-semibold text-[var(--gy-text)]">{value == null ? "—" : `${Math.round(value)}%`}</span>
    </div>
  );
}

const pctOf = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : null);

// ── Leads ────────────────────────────────────────────────────────────────

const FUNNEL: { status: string; label: string; color: string }[] = [
  { status: "PENDING", label: "New", color: "var(--gy-info)" },
  { status: "CONTACTED", label: "Contacted", color: "var(--gy-primary)" },
  { status: "QUALIFIED", label: "Qualified", color: "var(--gy-secondary, var(--gy-primary))" },
  { status: "QUOTED", label: "Quoted", color: "var(--gy-warning)" },
  { status: "WON", label: "Won", color: "var(--gy-success)" },
];

export const LeadsPanel = memo(function LeadsPanel({ data, className }: { data: AdminOverviewData; className?: string }) {
  const leads = data.leads ?? {
    total: 0,
    newLast30d: 0,
    byStatus: {},
    trend: [],
    rates: {},
  };
  const byStatus = leads.byStatus ?? {};
  const max = Math.max(1, ...FUNNEL.map((f) => byStatus[f.status] ?? 0));
  const trend = (leads.trend ?? []).map((t) => ({ label: t.date ? t.date.slice(5) : "", Leads: t.count }));
  const rates = leads.rates ?? {};
  const lost = byStatus.LOST ?? 0;

  return (
    <GlassSection
      className={className}
      title="Leads"
      subtitle={`${formatNumber(leads.total ?? 0)} total · ${formatNumber(leads.newLast30d ?? 0)} in the last 30 days`}
      aside={
        <Link href="/admin/leads" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--gy-primary)] hover:underline">
          Open leads <ArrowUpRight className="size-3" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="space-y-1.5 lg:col-span-2">
          {FUNNEL.map((f) => {
            const count = byStatus[f.status] ?? 0;
            return (
              <div key={f.status} className="flex items-center gap-2 text-xs">
                <span className="w-16 text-[var(--gy-text-secondary)]">{f.label}</span>
                <div className="h-5 flex-1 overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--gy-border)_45%,transparent)]">
                  <div
                    className="flex h-full items-center rounded-md px-1.5 text-[11px] font-semibold text-white transition-[width] duration-700"
                    style={{ width: `${Math.max(count ? 8 : 0, (count / max) * 100)}%`, background: f.color }}
                  >
                    {count > 0 ? count : ""}
                  </div>
                </div>
                {count === 0 && <span className="w-4 text-[var(--gy-text-subtle)]">0</span>}
              </div>
            );
          })}
          {lost > 0 && <p className="pt-0.5 text-xs text-[var(--gy-text-subtle)]">{lost} lost</p>}
        </div>

        <div className="lg:col-span-3">
          {trend.some((t) => t.Leads > 0) ? (
            <AreaChart data={trend} xAxisKey="label" height={150} showLegend={false} showGrid={false} series={[{ key: "Leads", name: "New leads", color: "var(--gy-info)" }]} />
          ) : (
            <div className="grid h-[150px] place-items-center text-xs text-[var(--gy-text-subtle)]">No new leads in the last 30 days</div>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Contacted", value: rates.contactedRate ?? null, tone: "var(--gy-primary)" },
          { label: "Replied < 24h", value: rates.respondedWithin24hRate ?? null, tone: "var(--gy-info)" },
          { label: "Lead → won", value: rates.conversionRate ?? null, tone: "var(--gy-success)" },
          { label: "Quotes accepted", value: rates.quoteAcceptanceRate ?? null, tone: "var(--gy-warning)" },
        ].map((r) => (
          <div key={r.label} className={`${GLASS_ROW} flex items-center gap-2 px-2.5 py-2`}>
            <Ring value={r.value} tone={r.tone} size={38} />
            <span className="text-xs text-[var(--gy-text-secondary)]">{r.label}</span>
          </div>
        ))}
      </div>
    </GlassSection>
  );
});

// ── Tracker ──────────────────────────────────────────────────────────────

interface TrackerItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  hint?: string;
  to: string;
  tone: "danger" | "warning" | "info" | "neutral";
}

const TONE_CLASS: Record<TrackerItem["tone"], string> = {
  danger: "bg-[var(--gy-danger)]/12 text-[var(--gy-danger)]",
  warning: "bg-[var(--gy-warning)]/12 text-[var(--gy-warning)]",
  info: "bg-[var(--gy-info)]/12 text-[var(--gy-info)]",
  neutral: "bg-[var(--gy-text-subtle)]/12 text-[var(--gy-text-secondary)]",
};

export const TrackerPanel = memo(function TrackerPanel({ data, className }: { data: AdminOverviewData; className?: string }) {


  const items: TrackerItem[] = [];
  const f = data.leads?.followUps;
  const orgCounts = data.organizations;

  if (data.developers) {
    items.push({ key: "devs", icon: <UserPlus className="size-3.5" />, label: "Developer approvals", count: data.developers.pending, to: "/admin/developers", tone: "warning" });
  }
  if (f) {
    items.push({ key: "overdue", icon: <AlertTriangle className="size-3.5" />, label: "Follow-ups overdue", count: f.overdue ?? 0, to: "/admin/leads", tone: "danger" });
    items.push({ key: "today", icon: <CalendarClock className="size-3.5" />, label: "Follow-ups due today", count: f.dueToday ?? 0, to: "/admin/leads", tone: "warning" });
    items.push({ key: "unassigned", icon: <Inbox className="size-3.5" />, label: "Unassigned open leads", count: f.unassignedOpen ?? 0, to: "/admin/leads", tone: "info" });
  } else if (data.leads?.awaitingFollowUp != null) {
    items.push({ key: "awaiting", icon: <Inbox className="size-3.5" />, label: "Leads awaiting follow-up", count: data.leads.awaitingFollowUp, to: "/admin/leads", tone: "info" });
  }
  if (orgCounts) {
    items.push({
      key: "trials",
      icon: <Hourglass className="size-3.5" />,
      label: "Trials ending in 14 days",
      count: orgCounts.trialsEndingIn14d,
      hint: `${orgCounts.trial} on trial`,
      to: "/admin/organizations",
      tone: "warning",
    });
    items.push({ key: "pendingOrgs", icon: <Clock className="size-3.5" />, label: "Organizations pending", count: orgCounts.pending, to: "/admin/organizations", tone: "info" });
    items.push({ key: "suspended", icon: <UserX className="size-3.5" />, label: "Suspended organizations", count: orgCounts.suspended, to: "/admin/organizations", tone: "neutral" });
  }
  if (data.paymentsSummary) {
    items.push({ key: "failed", icon: <CircleDollarSign className="size-3.5" />, label: "Failed payments · 30 days", count: data.paymentsSummary.failedLast30d, to: "/admin/payments", tone: "danger" });
  }

  const services = data.platform?.services ?? [];
  const unhealthy = services.filter((s) => !s.healthy);
  const open = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <GlassSection
      className={className}
      title="Tracker"
      subtitle={open > 0 ? `${open} item${open === 1 ? "" : "s"} need attention` : "Nothing waiting on you"}
    >
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.to}
            className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--gy-surface)_70%,transparent)] ${item.count === 0 ? "opacity-60" : ""}`}
          >
            <span className={`grid size-6 shrink-0 place-items-center rounded-md ${TONE_CLASS[item.count ? item.tone : "neutral"]}`}>{item.icon}</span>
            <span className="min-w-0 flex-1 truncate text-xs text-[var(--gy-text)]">
              {item.label}
              {item.hint && <span className="text-[var(--gy-text-subtle)]"> · {item.hint}</span>}
            </span>
            <span className="text-sm font-semibold text-[var(--gy-text)]">{item.count}</span>
          </Link>
        ))}
        {services.length > 0 && (
          <div className="mt-1 flex items-center gap-2.5 border-t border-[color-mix(in_srgb,var(--gy-border)_60%,transparent)] px-2 pt-2">
            <span className={`grid size-6 shrink-0 place-items-center rounded-md ${unhealthy.length ? TONE_CLASS.danger : "bg-[var(--gy-success)]/12 text-[var(--gy-success)]"}`}>
              <ServerCog className="size-3.5" />
            </span>
            <span className="flex-1 text-xs text-[var(--gy-text)]">
              {unhealthy.length ? `${unhealthy.map((s) => s.name).join(", ")} unhealthy` : "All services healthy"}
            </span>
            <span className="text-xs text-[var(--gy-text-subtle)]">
              {services.filter((s) => s.healthy).length}/{services.length}
            </span>
          </div>
        )}
      </div>
    </GlassSection>
  );
});

// ── Growth rates ─────────────────────────────────────────────────────────

export const GrowthPanel = memo(function GrowthPanel({ data, className }: { data: AdminOverviewData; className?: string }) {
  const orgs = data.organizations;
  const users = data.platform?.users;
  const seats = data.paymentsSummary?.seats;
  const leads = data.leads;

  const tiles: { label: string; value: number | null; caption: string; tone: string }[] = [];
  if (orgs) {
    tiles.push({
      label: "Organization growth",
      value: pctOf(orgs.newLast30d, Math.max(1, orgs.total - orgs.newLast30d)),
      caption: `+${orgs.newLast30d} in 30 days · ${orgs.total} total`,
      tone: "var(--gy-primary)",
    });
    tiles.push({ label: "Active organizations", value: pctOf(orgs.active, orgs.total), caption: `${orgs.active} of ${orgs.total} active`, tone: "var(--gy-success)" });
  }
  if (users) {
    tiles.push({
      label: "User growth",
      value: users.growthPercent,
      caption: `+${users.newLast30d} users in 30 days`,
      tone: "var(--gy-info)",
    });
  }
  if (leads) {
    const prev = leads.newPrev30d ?? 0;
    const now = leads.newLast30d ?? 0;
    tiles.push({
      label: "Lead growth",
      value: prev > 0 ? Math.round(((now - prev) / prev) * 100) : null,
      caption: `${now} leads vs ${prev} the month before`,
      tone: "var(--gy-warning)",
    });
  }
  if (seats) {
    tiles.push({
      label: "Seat utilisation",
      value: seats.utilisation ?? null,
      caption: `${seats.seatsUsedOnPaidPlans ?? 0} of ${seats.seatsPurchased ?? 0} paid seats used`,
      tone: "var(--gy-success)",
    });
  }
  if (tiles.length === 0) return null;

  return (
    <GlassSection className={className} title="Growth" subtitle="Last 30 days">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {tiles.map((t) => (
          <div key={t.label} className={`${GLASS_ROW} flex items-center gap-2.5 px-2.5 py-2`}>
            <Ring value={t.value} tone={t.tone} />
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-[var(--gy-text)]">{t.label}</div>
              <div className="truncate text-xs text-[var(--gy-text-subtle)]">{t.caption}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassSection>
  );
});

// ── Activity feed ────────────────────────────────────────────────────────

interface FeedItem {
  id: string;
  at: string;
  icon: React.ReactNode;
  tone: string;
  title: string;
  detail: string;
}

export const ActivityFeed = memo(function ActivityFeed({ data, className }: { data: AdminOverviewData; className?: string }) {
  const items: FeedItem[] = [];
  for (const l of data.recentLeads) {
    items.push({
      id: `lead-${l.id}`,
      at: l.createdAt,
      icon: <Inbox className="size-3.5" />,
      tone: "bg-[var(--gy-info)]/12 text-[var(--gy-info)]",
      title: `New ${l.type === "WAITLIST" ? "waitlist sign-up" : "lead"}: ${l.name || l.email || "Unknown"}`,
      detail: l.company || l.email || "—",
    });
  }
  for (const u of data.platform?.recentUsers ?? []) {
    items.push({
      id: `user-${u.id}`,
      at: u.createdAt,
      icon: <BadgeCheck className="size-3.5" />,
      tone: "bg-[var(--gy-primary)]/12 text-[var(--gy-primary)]",
      title: `${u.fullName} joined`,
      detail: u.userType === "DEVELOPER" ? "Developer account" : (u.organization?.name ?? "Organization account"),
    });
  }
  for (const o of data.recentOrganizations) {
    items.push({
      id: `org-${o.id}`,
      at: o.createdAt,
      icon: <Building2 className="size-3.5" />,
      tone: "bg-[var(--gy-secondary,var(--gy-primary))]/12 text-[var(--gy-text-secondary)]",
      title: `Organization created: ${o.name}`,
      detail: o.planTier ? `${o.planTier.charAt(0)}${o.planTier.slice(1).toLowerCase()} plan` : "Free plan",
    });
  }
  for (const p of data.recentPayments) {
    items.push({
      id: `pay-${p.id}`,
      at: p.paidAt ?? p.createdAt,
      icon: <CircleDollarSign className="size-3.5" />,
      tone: p.status === "FAILED" ? "bg-[var(--gy-danger)]/12 text-[var(--gy-danger)]" : "bg-[var(--gy-success)]/12 text-[var(--gy-success)]",
      title: `${p.status === "FAILED" ? "Payment failed" : p.status === "PAID" ? "Payment received" : p.status === "REFUNDED" ? "Payment refunded" : "Checkout started"} · ${money(p.amount, p.currency)}`,
      detail: p.organization?.name ?? "—",
    });
  }
  const feed = items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 9);

  return (
    <GlassSection className={className} title="Recent activity">
      {feed.length === 0 ? (
        <SectionEmpty icon={<Clock className="size-5" />} title="No recent activity" />
      ) : (
        <ol className="relative space-y-2.5 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-px before:bg-[color-mix(in_srgb,var(--gy-border)_70%,transparent)]">
          {feed.map((item) => (
            <li key={item.id} className="relative flex items-start gap-2.5">
              <span className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full ring-2 ring-[var(--gy-background)] ${item.tone}`}>{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-[var(--gy-text)]">{item.title}</div>
                <div className="truncate text-xs text-[var(--gy-text-subtle)]">{item.detail}</div>
              </div>
              <span suppressHydrationWarning className="shrink-0 text-[11px] text-[var(--gy-text-subtle)]">{relativeTime(item.at)}</span>
            </li>
          ))}
        </ol>
      )}
    </GlassSection>
  );
});

/** Small status chip for the greeting row. */
export function LiveChip({ label }: { label: string }) {
  return (
    <Chip variant="soft" size="xs">
      <span className="mr-1 inline-block size-1.5 rounded-full bg-[var(--gy-success)]" />
      <span suppressHydrationWarning>{label}</span>
    </Chip>
  );
}
