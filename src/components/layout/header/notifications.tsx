"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Tooltip, Typography } from "@galyan/ui";
import { Bell, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "@/src/lib/auth-context";

export function Notifications() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const orgName =
    organization?.name || user?.organization?.name || "Your organization";
  const needs2FA = !user?.twoFactorEnabled;

  return (
    <Tooltip
      trigger="click"
      position="bottom"
      maxWidth={320}
      hasArrow={false}
      content={
        <div className="w-72 space-y-3 py-1 text-left">
          <div className="flex items-center justify-between">
            <Typography
              variant="span"
              weight="semibold"
              className="text-sm text-[var(--gy-text)]"
            >
              Notifications
            </Typography>
            <Chip size="sm" variant="soft">
              Live
            </Chip>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gy-success)]" />
            <div>
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
          </div>
          {needs2FA && (
            <div className="flex items-start gap-2.5">
              <Shield className="mt-0.5 size-4 shrink-0 text-[var(--gy-warning)]" />
              <div className="space-y-1">
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
                <Button
                  variant="link"
                  size="xs"
                  onClick={() => navigate("/security")}
                >
                  Configure now
                </Button>
              </div>
            </div>
          )}
        </div>
      }
    >
      <span className="relative inline-flex">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notifications"
          leftIcon={<Bell className="size-4" />}
        />
        {needs2FA && (
          <span className="pointer-events-none absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--gy-primary)] ring-2 ring-[var(--gy-surface)]" />
        )}
      </span>
    </Tooltip>
  );
}
