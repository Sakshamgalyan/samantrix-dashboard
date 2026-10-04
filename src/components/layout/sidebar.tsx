"use client";

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  Sidebar as GySidebar,
  SidebarText,
  Tabs,
  Tooltip,
  Typography,
  useSidebar,
  type SidebarItemData,
} from "@galyan/ui";
import { ExternalLink, ShieldCheck, Building2, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { isPlatformAdmin } from "@/lib/roles";
import { useAutoRefresh } from "@/components/admin";
import { SamantrixMark } from "@/components/brand/samantrix-logo";
import { useRealtime } from "@/lib/realtime-context";
import { DASHBOARD_ROUTES, type DashboardRoute } from "./routes";
import type { ConsoleScope } from "./scope-context";

// Galyan's `floating` variant gives the inset, radius and height; the glass surface comes
// from theme tokens so it reads in both modes (Galyan's own glass variant is white-only).
// `!` beats Galyan's own sidebar background rule.
// Glass surface matching the header bar (Galyan's glass Card); spelled out because Tailwind only sees literal class names.
const FLOATING_GLASS =
  "border! border-[color-mix(in_srgb,var(--gy-border)_70%,transparent)]! bg-[color-mix(in_srgb,var(--gy-surface)_62%,transparent)]! shadow-[0_8px_32px_-12px_rgb(0_0_0/0.25)]! backdrop-blur-2xl! backdrop-saturate-150!";

const SCOPE_TABS = [
  { id: "admin", label: "Platform", icon: <ShieldCheck className="size-3.5" /> },
  { id: "workspace", label: "Workspace", icon: <Building2 className="size-3.5" /> },
];

const WORKPLACE_URL = process.env.NEXT_PUBLIC_WORKPLACE_URL || "http://localhost:4000/office";

interface SidebarProps {
  scope: ConsoleScope;
  activeRoute?: DashboardRoute;
  canSwitchScope: boolean;
  onScopeChange: (scope: ConsoleScope) => void;
}

/** Developers awaiting approval, for the sidebar badge (platform admins in the admin console only). */
function usePendingDevelopers(enabled: boolean): number {
  const [pending, setPending] = useState(0);
  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await api.get<{ counts: { pending: number } }>("/auth/developers?status=PENDING_VERIFICATION");
      setPending(res?.counts?.pending ?? 0);
    } catch {
      // Badge is best-effort; the Developers page shows the real error
    }
  }, [enabled]);
  useAutoRefresh(load);
  return enabled ? pending : 0;
}

/** Brand block; collapses to the logo mark when the rail is collapsed. */
function SidebarBrand({ subtitle }: { subtitle: string }) {
  const { isCollapsed } = useSidebar();
  return (
    <div className="flex items-center gap-3 min-w-0">
      <SamantrixMark
        title={isCollapsed ? "Samantrix" : ""}
        className="size-9 shrink-0 drop-shadow-[0_6px_14px_rgb(124_92_255/0.35)]"
      />
      {!isCollapsed && (
        <div className="sx-reveal min-w-0">
          <Typography variant="span" weight="extrabold" className="block text-sm tracking-tight text-[var(--gy-text)]">
            Samantrix
          </Typography>
          <Typography variant="span" className="block truncate text-[11px] text-[var(--gy-text-subtle)]">
            {subtitle}
          </Typography>
        </div>
      )}
    </div>
  );
}

/** Realtime gateway health (moved here from the header). */
function GatewayStatus() {
  const { isCollapsed } = useSidebar();
  const { status, latencyMs, reconnect } = useRealtime();
  const connected = status === "connected";
  const pending = status === "connecting" || status === "reconnecting";
  const label = connected
    ? `Live${latencyMs > 0 ? ` · ${latencyMs}ms` : ""}`
    : pending
      ? "Reconnecting"
      : "Offline";
  const color = connected ? "var(--gy-success)" : pending ? "var(--gy-warning)" : "var(--gy-danger)";

  const dot = (
    <span className="relative flex size-2 shrink-0">
      {connected && (
        <span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ background: color }} />
      )}
      <span className="relative inline-flex size-2 rounded-full" style={{ background: color }} />
    </span>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={`Realtime gateway: ${label}`} position="right" size="sm">
        <span className="flex justify-center py-1">{dot}</span>
      </Tooltip>
    );
  }

  return (
    <div className="sx-reveal flex items-center justify-between gap-2 rounded-lg px-1 text-[11px] text-[var(--gy-text-subtle)]">
      <span className="flex items-center gap-2">
        {dot}
        Realtime · {label}
      </span>
      {!connected && !pending && (
        <Button variant="ghost" size="xs" leftIcon={<RefreshCw className="size-3" />} onClick={reconnect}>
          Retry
        </Button>
      )}
    </div>
  );
}

function SidebarUser() {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();
  const initial = user?.fullName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="space-y-3">
      <GatewayStatus />
      {!isCollapsed && (
        <Button
          className="sx-reveal"
          variant="soft"
          size="sm"
          fullWidth
          href={WORKPLACE_URL}
          external
          leftIcon={<Sparkles className="size-3.5" />}
          rightIcon={<ExternalLink className="size-3.5" />}
        >
          Launch Virtual Office
        </Button>
      )}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--gy-primary)]/15 text-xs font-bold text-[var(--gy-primary)]">
          {initial}
        </span>
        {!isCollapsed && (
          <div className="sx-reveal min-w-0">
            <Typography variant="span" weight="semibold" className="block truncate text-xs text-[var(--gy-text)]">
              {user?.fullName || "—"}
            </Typography>
            <Typography variant="span" className="block truncate text-[11px] text-[var(--gy-text-subtle)]">
              {user?.email || ""}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ scope, activeRoute, canSwitchScope, onScopeChange }: SidebarProps) {
  const navigate = useNavigate();
  const { user, organization } = useAuth();

  const orgName = organization?.name || user?.organization?.name || "My Organization";
  const planTier = organization?.planTier;
  const pendingDevelopers = usePendingDevelopers(scope === "admin" && isPlatformAdmin(user));

  const items = useMemo<SidebarItemData[]>(
    () =>
      DASHBOARD_ROUTES.filter((r) => r.scope === "shared" || r.scope === scope).map((r) => {
        const Icon = r.icon;
        const item: SidebarItemData = {
          id: r.path,
          label: r.label,
          icon: <Icon className="size-4" />,
          group: r.group,
          badge: r.badge,
          badgeColor: r.badgeColor,
        };
        // Live counts replace the static route badges
        if (r.path === "admin/developers") {
          item.badge = pendingDevelopers > 0 ? String(pendingDevelopers) : undefined;
          item.badgeColor = "warning";
        }
        if (r.path === "admin/leads") item.badge = undefined;
        if (r.path === "security") {
          item.badge = user?.twoFactorEnabled ? undefined : "Action";
          item.badgeColor = "warning";
        }
        if (r.path === "subscription" && planTier) {
          item.badge = planTier;
          item.badgeColor = "primary";
        }
        return item;
      }),
    [scope, user?.twoFactorEnabled, planTier, pendingDevelopers],
  );

  return (
    <GySidebar
      items={items}
      activeItemId={activeRoute?.path}
      onItemClick={(id) => navigate(`/${id}`)}
      variant="floating"
      activeVariant="line"
      width={268}
      collapsedWidth={72}
      breakpoint={1024}
      className={`sx-sidebar ${FLOATING_GLASS}`}
      header={
        <div className="w-full space-y-3">
          <SidebarBrand subtitle={scope === "admin" ? "Platform Admin" : orgName} />
          {canSwitchScope && (
            <SidebarText>
              <Tabs
                items={SCOPE_TABS}
                activeTab={scope}
                onTabChange={(id) => onScopeChange(id as ConsoleScope)}
                variant="ghost"
                size="sm"
                fullWidth
              />
            </SidebarText>
          )}
          {scope === "workspace" && planTier && (
            <SidebarText>
              <Chip variant="soft" size="sm">
                {planTier} plan
              </Chip>
            </SidebarText>
          )}
        </div>
      }
      footer={<SidebarUser />}
    />
  );
}
