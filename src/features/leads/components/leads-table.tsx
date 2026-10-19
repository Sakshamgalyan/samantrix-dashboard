"use client";

import { Chip, Table, Typography, type Column } from "@galyan/ui";
import { Inbox, Phone } from "lucide-react";
import { formatDate, relativeTime } from "@/utils/format";
import { SectionEmpty } from "@/components/layout/common/states";
import { tablePagination } from "@/features/common/pagination";
import { useLeadsContext } from "@/features/leads/context";
import { STATUS_META, TYPE_LABEL, leadName } from "@/features/leads/common/constants";
import type { LeadListItem } from "@/features/leads/types";

const FollowUp = ({ iso }: { iso: string | null }) => {
  if (!iso) {
    return (
      <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
        —
      </Typography>
    );
  }
  const due = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday.getTime() + 86_400_000);
  const overdue = due < startOfToday;
  const today = !overdue && due < endOfToday;

  const color = overdue
    ? "var(--gy-danger)"
    : today
      ? "var(--gy-warning)"
      : "var(--gy-text-secondary)";

  return (
    <Typography
      variant="small"
      textColor={color}
      weight={overdue || today ? "medium" : "normal"}
      className="whitespace-nowrap text-xs"
    >
      {overdue ? "Overdue · " : today ? "Today · " : ""}
      {formatDate(iso)}
    </Typography>
  );
};

export const LeadsTable = () => {
  const { state, openDetail, setPage } = useLeadsContext();
  const { items, meta, listLoading } = state;

  const columns: Column<LeadListItem>[] = [
    {
      key: "lead",
      header: "Lead",
      accessor: (row) => (
        <div className="min-w-0 py-0.5">
          <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="truncate block">
            {leadName(row)}
          </Typography>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs block">
            {[row.jobTitle, row.company, row.country].filter(Boolean).join(" · ") || "—"}
          </Typography>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      accessor: (row) => (
        <div className="min-w-0 py-0.5 text-xs">
          <Typography variant="small" textColor="var(--gy-text)" className="truncate text-xs block select-all">
            {row.email}
          </Typography>
          {row.phone ? (
            <div className="flex items-center gap-1 truncate text-[var(--gy-text-secondary)]">
              <Phone className="size-3 shrink-0 text-[var(--gy-text-subtle)]" />
              <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs">
                {row.phone}
              </Typography>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "100px",
      accessor: (row) => (
        <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
          {TYPE_LABEL[row.type]}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      accessor: (row) => (
        <Chip size="sm" variant={STATUS_META[row.status]?.variant ?? "neutral"}>
          {STATUS_META[row.status]?.label ?? row.status}
        </Chip>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      width: "130px",
      accessor: (row) => (
        <Typography
          variant="small"
          textColor={row.assignedTo ? "var(--gy-text)" : "var(--gy-text-subtle)"}
          className="truncate text-xs block"
        >
          {row.assignedTo ? row.assignedTo.fullName : "Unassigned"}
        </Typography>
      ),
    },
    {
      key: "lastContactedAt",
      header: "Last contact",
      width: "120px",
      accessor: (row) => (
        <Typography variant="small" textColor="var(--gy-text-secondary)" className="whitespace-nowrap text-xs">
          {row.lastContactedAt ? relativeTime(row.lastContactedAt) : "Never"}
        </Typography>
      ),
    },
    {
      key: "nextFollowUpAt",
      header: "Follow-up",
      width: "140px",
      accessor: (row) => <FollowUp iso={row.nextFollowUpAt} />,
    },
    {
      key: "createdAt",
      header: "Received",
      width: "100px",
      accessor: (row) => (
        <Typography variant="small" textColor="var(--gy-text-secondary)" className="whitespace-nowrap text-xs">
          {relativeTime(row.createdAt)}
        </Typography>
      ),
    },
  ];

  if (!listLoading && items.length === 0 && !state.listError) {
    return (
      <SectionEmpty
        icon={<Inbox className="size-5" />}
        title="No leads here"
        description="Try another view, filter or search. New enquiries from the website appear automatically."
      />
    );
  }

  return (
    <div className="overflow-x-auto w-full min-w-0 rounded-xl border border-[var(--gy-border)]/40 bg-[var(--gy-surface)]/20">
      <Table<LeadListItem>
        columns={columns}
        data={items}
        rowKey={(row) => row.id}
        size="sm"
        hoverable
        isLoading={listLoading}
        onRowClick={(row) => openDetail(row.id)}
        pagination={tablePagination(meta)}
        onPageChange={setPage}
      />
    </div>
  );
};
