"use client";

import { Button, Chip } from "@galyan/ui";
import { CheckCircle2, XCircle } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { relativeTime } from "@/utils/format";
import { useDevelopersContext } from "@/features/developers/context";

/** Registrations awaiting a decision, above the full list. */
export function PendingQueue() {
  const { state, pendingDevelopers, canManageDevelopers, openDialog } =
    useDevelopersContext();
  const pendingTotal = state.summary?.counts.pending ?? pendingDevelopers.length;

  return (
    <GlassSection
      title="Waiting for approval"
      subtitle={
        canManageDevelopers
          ? "Approve with a role, or reject. The developer is emailed either way."
          : "Only managers and superadmins can approve developers."
      }
      aside={
        <Chip variant="warning" size="sm">
          {pendingTotal} pending
        </Chip>
      }
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {pendingDevelopers.map((dev) => (
          <div
            key={dev.id}
            className={`${GLASS_ROW} flex flex-col justify-between gap-2.5 p-3 sm:flex-row sm:items-center`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--gy-warning)]/15 text-xs font-semibold text-[var(--gy-warning)] ring-1 ring-[var(--gy-warning)]/20">
                {dev.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[var(--gy-text)]">
                  {dev.fullName}
                </div>
                <div className="truncate text-xs text-[var(--gy-text-secondary)]">
                  {dev.email}
                </div>
                <div className="text-[11px] text-[var(--gy-text-subtle)]">
                  {dev.phone ? `${dev.phone} · ` : ""}Joined {relativeTime(dev.createdAt)}
                </div>
              </div>
            </div>
            {canManageDevelopers && (
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--gy-border)]/20 pt-2 sm:border-t-0 sm:pt-0">
                <Button
                  variant="success"
                  size="xs"
                  leftIcon={<CheckCircle2 className="size-3.5" />}
                  onClick={() => openDialog({ kind: "approve", dev })}
                  className="flex-1 sm:flex-initial"
                >
                  Approve
                </Button>
                <Button
                  variant="danger-soft"
                  size="xs"
                  leftIcon={<XCircle className="size-3.5" />}
                  onClick={() => openDialog({ kind: "reject", dev })}
                  aria-label={`Reject ${dev.fullName}`}
                  className="flex-1 sm:flex-initial"
                >
                  <span className="sm:hidden">Reject</span>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      {pendingTotal > pendingDevelopers.length && (
        <p className="pt-2 text-xs text-[var(--gy-text-subtle)]">
          Showing the newest {pendingDevelopers.length} of {pendingTotal}. Filter
          the list below by Pending to see them all.
        </p>
      )}
    </GlassSection>
  );
}
