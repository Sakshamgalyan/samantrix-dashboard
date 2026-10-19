"use client";

import { useState } from "react";
import { Button, Chip, Input, Table, Typography, type Column } from "@galyan/ui";
import { Search, Send, Users } from "lucide-react";
import { relativeTime } from "@/utils/format";
import { AdminLoadError, SectionEmpty } from "@/components/layout/common/states";
import { tablePagination } from "@/features/common/pagination";
import { useLeadsContext } from "@/features/leads/context";
import { WAITLIST_STATUS_META } from "@/features/leads/common/constants";
import type { WaitlistEntry, WaitlistStatus } from "@/features/leads/types";

const FILTERS: Array<{ id: WaitlistStatus | "ALL"; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "QUEUED", label: "Queued" },
  { id: "INVITED", label: "Invited" },
  { id: "ONBOARDED", label: "Onboarded" },
  { id: "REJECTED", label: "Rejected" },
];

/**
 * Early-access sign-ups, paged / searched / filtered on the server: select queued people on the
 * page and invite them in one go. Chip counts come from the leads summary.
 */
export const WaitlistPanel = () => {
  const {
    state,
    permissions,
    setWaitlistSelection,
    setWaitlistStatus,
    setWaitlistSearchInput,
    setWaitlistPage,
    inviteWaitlist,
    openWaitlistLead,
    refresh,
  } = useLeadsContext();
  const status = state.waitlistFilters.status;
  const rows = state.waitlist;
  const [inviting, setInviting] = useState(false);

  const w = state.summary?.waitlist;
  const counts: Record<WaitlistStatus | "ALL", number | null> = {
    ALL: w?.total ?? null,
    QUEUED: w?.queued ?? null,
    INVITED: w?.invited ?? null,
    ONBOARDED: w?.onboarded ?? null,
    REJECTED: w?.rejected ?? null,
  };

  const columns: Column<WaitlistEntry>[] = [
    {
      key: "person",
      header: "Person",
      accessor: (w) => (
        <div className="min-w-0 py-0.5">
          <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="truncate block">
            {w.name || w.email}
          </Typography>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs block">
            {[w.name ? w.email : null, w.phone].filter(Boolean).join(" · ") || "—"}
          </Typography>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      accessor: (w) => (
        <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs block">
          {[w.company, w.teamSize ? `Team ${w.teamSize}` : null, w.country].filter(Boolean).join(" · ") || "—"}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      accessor: (w) => (
        <Chip size="sm" variant={WAITLIST_STATUS_META[w.status].variant}>
          {WAITLIST_STATUS_META[w.status].label}
        </Chip>
      ),
    },
    {
      key: "source",
      header: "Source",
      width: "130px",
      accessor: (w) => (
        <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
          {w.source || "—"}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      width: "110px",
      accessor: (w) => (
        <Typography variant="small" textColor="var(--gy-text-secondary)" className="whitespace-nowrap text-xs">
          {relativeTime(w.createdAt)}
        </Typography>
      ),
    },
  ];

  if (state.waitlistError && state.waitlist.length === 0) {
    return (
      <AdminLoadError
        title="Waitlist unavailable"
        message={state.waitlistError}
        onRetry={() => void refresh()}
      />
    );
  }

  const selectable = permissions.canWork;
  const selected = state.selectedWaitlistIds;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Waitlist status">
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              size="sm"
              clickable
              selected={status === f.id}
              variant={status === f.id ? "solid" : "outline"}
              onClick={() => setWaitlistStatus(f.id)}
            >
              {f.label}
              {counts[f.id] !== null && (
                <Typography variant="small" as="span" className="ml-1 opacity-75 tabular-nums text-xs">
                  {counts[f.id]}
                </Typography>
              )}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-60">
            <Input
              size="sm"
              placeholder="Search waitlist"
              value={state.waitlistSearchInput}
              onChange={(e) => setWaitlistSearchInput(e.target.value)}
              leftIcon={<Search className="size-3.5" />}
              aria-label="Search waitlist"
              className="w-full"
            />
          </div>
          {selectable && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Send className="size-3.5" />}
              disabled={selected.length === 0}
              isLoading={inviting}
              className="shrink-0"
              onClick={async () => {
                setInviting(true);
                await inviteWaitlist();
                setInviting(false);
              }}
            >
              Invite{selected.length > 0 ? ` ${selected.length}` : ""}
            </Button>
          )}
        </div>
      </div>

      {!state.waitlistLoading && rows.length === 0 ? (
        <SectionEmpty
          icon={<Users className="size-5" />}
          title="Nobody here yet"
          description="Sign-ups from the website's early-access form show up here."
        />
      ) : (
        <div className="overflow-x-auto w-full min-w-0 rounded-xl border border-[var(--gy-border)]/40 bg-[var(--gy-surface)]/20">
          <Table<WaitlistEntry>
            columns={columns}
            data={rows}
            rowKey={(w) => w.id}
            size="sm"
            hoverable
            isLoading={state.waitlistLoading}
            isRowSelection={selectable}
            selectedRows={selected}
            onRowSelect={setWaitlistSelection}
            onRowClick={(w) => openWaitlistLead(w.id)}
            pagination={tablePagination(state.waitlistMeta)}
            onPageChange={setWaitlistPage}
          />
        </div>
      )}
    </div>
  );
};
