"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Chip,
  Menu,
  Typography,
  type MenuItem,
} from "@galyan/ui";
import {
  Building2,
  Code2,
  CreditCard,
  ExternalLink,
  LogOut,
  Rocket,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useDashboardScope } from "@/components/layout/scope-context";
import { developerRoleLabel } from "@/utils/roles";

const WORKPLACE_URL =
  process.env.NEXT_PUBLIC_WORKPLACE_URL || "http://localhost:4200/office";

export const ProfileMenu: React.FC = () => {
  const router = useRouter();
  const { scope, changeScope, canSwitchScope } = useDashboardScope();
  const { user, organization, logout } = useAuth();

  const isDeveloper =
    user?.userType === "DEVELOPER" ||
    Boolean(user?.platformRole) ||
    scope === "admin";

  const initial = user?.fullName?.charAt(0).toUpperCase() || "?";
  const photoUrl = user?.avatarUrl || user?.avatar;

  const items = useMemo<MenuItem[]>(() => {
    if (isDeveloper) {
      return [
        {
          id: "dev-versioning",
          icon: <Rocket className="size-4 text-[var(--gy-primary)]" />,
          label: (
            <div className="flex w-full items-center justify-between gap-2 text-left">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[var(--gy-text)]">
                  App releases
                </span>
                <span className="text-[10px] text-[var(--gy-text-subtle)]">
                  Desktop & WebGL builds
                </span>
              </div>
              <span className="rounded bg-[var(--gy-primary)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--gy-primary)]">
                v1.4
              </span>
            </div>
          ),
        },
        {
          id: "dev-settings",
          icon: <Settings className="size-4 text-[var(--gy-text-secondary)]" />,
          label: (
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[var(--gy-text)]">
                Settings
              </span>
              <span className="text-[10px] text-[var(--gy-text-subtle)]">
                Environment & system keys
              </span>
            </div>
          ),
        },
        {
          id: "workplace",
          icon: <ExternalLink className="size-4 text-emerald-500" />,
          label: (
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[var(--gy-text)]">
                Virtual Workplace
              </span>
              <span className="text-[10px] text-[var(--gy-text-subtle)]">
                Open 3D office space
              </span>
            </div>
          ),
        },
        { id: "divider", label: "", divider: true },
        {
          id: "logout",
          icon: <LogOut className="size-4 text-rose-500" />,
          label: (
            <span className="text-xs font-semibold text-rose-500 hover:text-rose-600">
              Sign out
            </span>
          ),
        },
      ];
    }

    const orgItems: MenuItem[] = [
      {
        id: "org-settings",
        icon: <Building2 className="size-4 text-[var(--gy-primary)]" />,
        label: (
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--gy-text)]">
              Organization Profile
            </span>
            <span className="text-[10px] text-[var(--gy-text-subtle)]">
              Workplace identity & branding
            </span>
          </div>
        ),
      },
      {
        id: "org-members",
        icon: <Users className="size-4 text-indigo-500" />,
        label: (
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--gy-text)]">
              Team Members
            </span>
            <span className="text-[10px] text-[var(--gy-text-subtle)]">
              Manage seats & roles
            </span>
          </div>
        ),
      },
      {
        id: "org-security",
        icon: <ShieldCheck className="size-4 text-amber-500" />,
        label: (
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--gy-text)]">
              Security & 2FA
            </span>
            <span className="text-[10px] text-[var(--gy-text-subtle)]">
              MFA enforcement & audit
            </span>
          </div>
        ),
      },
      {
        id: "org-billing",
        icon: <CreditCard className="size-4 text-emerald-500" />,
        label: (
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--gy-text)]">
              Plan & Billing
            </span>
            <span className="text-[10px] text-[var(--gy-text-subtle)]">
              Usage & subscription tier
            </span>
          </div>
        ),
      },
    ];

    if (canSwitchScope) {
      orgItems.push({
        id: "switch-to-admin",
        icon: <Code2 className="size-4 text-cyan-500" />,
        label: (
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--gy-text)]">
              Developer Console
            </span>
            <span className="text-[10px] text-[var(--gy-text-subtle)]">
              Switch administrative scope
            </span>
          </div>
        ),
      });
    }

    orgItems.push(
      {
        id: "workplace",
        icon: <ExternalLink className="size-4 text-emerald-500" />,
        label: (
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--gy-text)]">
              Open Virtual Office
            </span>
            <span className="text-[10px] text-[var(--gy-text-subtle)]">
              Join live virtual room
            </span>
          </div>
        ),
      },
      { id: "divider", label: "", divider: true },
      {
        id: "logout",
        icon: <LogOut className="size-4 text-rose-500" />,
        label: (
          <span className="text-xs font-semibold text-rose-500 hover:text-rose-600">
            Sign out
          </span>
        ),
      },
    );

    return orgItems;
  }, [isDeveloper, canSwitchScope]);

  const onSelect = (id: string) => {
    switch (id) {
      case "logout":
        void logout();
        break;
      case "workplace":
        window.open(WORKPLACE_URL, "_blank", "noopener,noreferrer");
        break;
      case "dev-versioning":
        router.push("/admin/versioning");
        break;
      case "dev-settings":
        router.push("/admin/settings");
        break;
      case "switch-to-admin":
        changeScope("admin");
        router.push("/admin");
        break;
      case "org-settings":
        router.push("/organization/settings");
        break;
      case "org-members":
        router.push("/organization/users");
        break;
      case "org-security":
        router.push("/organization/security");
        break;
      case "org-billing":
        router.push("/organization/subscription");
        break;
      default:
        router.push(`/${id}`);
        break;
    }
  };

  return (
    <Menu
      trigger={
        photoUrl ? (
          <Avatar
            src={photoUrl}
            name={user?.fullName || "User"}
            size="md"
            variant="glass"
            status="online"
            glow
            interactive
            aria-label="Account menu"
          />
        ) : (
          <Badge
            content={initial}
            variant={isDeveloper ? "primary" : "neutral"}
            size="xl"
            shape="circle"
            glow
            interactive
            aria-label="Account menu"
          />
        )
      }
      placement="bottom-end"
      width={304}
      size="sm"
      variant="bordered"
      className="shadow-2xl !max-w-[calc(100vw-24px)] overflow-hidden"
      items={items}
      onItemClick={onSelect}
      header={
        <div className="space-y-2 text-left pb-1">
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <Avatar
                src={photoUrl}
                name={user?.fullName || "User"}
                size="sm"
                variant="glass"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--gy-primary)]/15 text-xs font-bold text-[var(--gy-primary)]">
                {initial}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <Typography
                variant="span"
                weight="semibold"
                className="block truncate text-sm text-[var(--gy-text)]"
              >
                {user?.fullName || "User"}
              </Typography>
              <Typography
                variant="span"
                className="block truncate text-xs text-[var(--gy-text-secondary)]"
              >
                {user?.email}
              </Typography>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {isDeveloper ? (
              <>
                <Chip size="sm" variant="primary">
                  {developerRoleLabel(user?.platformRole) ||
                    user?.platformRole ||
                    "Superadmin"}
                </Chip>
                <Chip size="sm" variant="neutral">
                  Developer Console
                </Chip>
              </>
            ) : (
              <>
                {user?.role && (
                  <Chip size="sm" variant="soft">
                    {user.role}
                  </Chip>
                )}
                {organization?.name && (
                  <Chip size="sm" variant="neutral">
                    {organization.name}
                  </Chip>
                )}
                {organization?.planTier && (
                  <Chip size="sm" variant="neutral">
                    {organization.planTier} Plan
                  </Chip>
                )}
              </>
            )}
          </div>
        </div>
      }
    />
  );
};

export default ProfileMenu;
