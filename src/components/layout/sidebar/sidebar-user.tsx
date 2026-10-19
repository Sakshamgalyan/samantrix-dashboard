"use client";

import { Button, Typography, useSidebar } from "@galyan/ui";
import { ExternalLink, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth";
import { WORKPLACE_URL } from "@/components/layout/sidebar/constants";

export function SidebarUser() {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();
  const initial = user?.fullName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="space-y-3">
      {!isCollapsed && (
        <>
          <Button
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
          <div className="h-px w-full bg-[var(--gy-border,#e2e8f0)]" role="separator" />
        </>
      )}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--gy-primary)]/15 text-xs font-bold text-[var(--gy-primary)]">
          {initial}
        </span>
        {!isCollapsed && (
          <div className="min-w-0">
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
