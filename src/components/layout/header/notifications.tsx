"use client";

import React from "react";
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
  ArrowRight,
  Bell,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useConsoleScope } from "@/components/layout/scope-context";

export const Notifications: React.FC = () => {
  const router = useRouter();
  const scope = useConsoleScope();
  const { user, organization } = useAuth();
  const orgName =
    organization?.name || user?.organization?.name || "Your organization";
  const needs2FA = !user?.twoFactorEnabled;

  const items: MenuItem[] = [
    {
      id: "workspace",
      icon: (
        <span className="mt-0.5 flex shrink-0 text-emerald-500">
          <CheckCircle2 className="size-4" />
        </span>
      ),
      label: (
        <div className="flex flex-col gap-0.5 text-left">
          <Typography
            variant="span"
            weight="medium"
            className="block text-xs text-[var(--gy-text)]"
          >
            Workspace provisioned
          </Typography>
          <Typography
            variant="span"
            className="block text-xs text-[var(--gy-text-secondary)]"
          >
            {orgName} floor plan and roles are active.
          </Typography>
        </div>
      ),
    },
    ...(needs2FA
      ? [
          {
            id: "security",
            icon: (
              <span className="mt-0.5 flex shrink-0 text-amber-500">
                <Shield className="size-4" />
              </span>
            ),
            label: (
              <div className="flex flex-col gap-0.5 text-left">
                <Typography
                  variant="span"
                  weight="medium"
                  className="block text-xs text-[var(--gy-text)]"
                >
                  Enable two-factor authentication
                </Typography>
                <Typography
                  variant="span"
                  className="block text-xs text-[var(--gy-text-secondary)]"
                >
                  Secure your organization with an authenticator app.
                </Typography>
              </div>
            ),
          },
        ]
      : []),
    { id: "divider", label: "", divider: true },
    {
      id: "show-all",
      icon: (
        <span className="flex shrink-0 text-[var(--gy-primary)]">
          <ArrowRight className="size-4" />
        </span>
      ),
      label: (
        <span className="text-xs font-semibold text-[var(--gy-primary)]">
          Show all alerts
        </span>
      ),
    },
  ];

  const onSelect = (id: string) => {
    if (id === "show-all") {
      router.push(scope === "admin" ? "/admin/notifications" : "/organization/notifications");
    } else if (id === "security") {
      router.push("/organization/security");
    } else if (id === "workspace") {
      router.push(scope === "admin" ? "/admin" : "/organization");
    }
  };

  return (
    <Menu
      trigger={
        <Badge
          dot
          variant="primary"
          ping={needs2FA}
          invisible={!needs2FA}
          placement="top-right"
          className="cursor-pointer"
        >
          <Avatar
            fallback={<Bell className="size-4 text-[var(--gy-text)]" />}
            size="md"
            variant="default"
            glow={needs2FA}
            interactive
            aria-label="Notifications"
          />
        </Badge>
      }
      placement="bottom-end"
      width={320}
      size="sm"
      variant="bordered"
      className="shadow-2xl !max-w-[calc(100vw-24px)] overflow-hidden"
      items={items}
      onItemClick={onSelect}
      header={
        <div className="flex items-center justify-between pb-1 text-left">
          <Typography
            variant="span"
            weight="semibold"
            className="text-sm text-[var(--gy-text)]"
          >
            Notifications
          </Typography>
          <Chip size="sm" variant={needs2FA ? "warning" : "soft"}>
            {needs2FA ? "Action required" : "Live"}
          </Chip>
        </div>
      }
    />
  );
};

export default Notifications;
