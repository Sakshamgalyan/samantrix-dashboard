"use client";

import { Chip, Table, Typography, type Column } from "@galyan/ui";
import { CheckCircle2, User } from "lucide-react";
import { tablePagination, type PaginationMeta } from "@/features/common/pagination";
import type { OrgAuditLogRow } from "@/features/audit-logs/types/api";

export interface AuditLogsTableProps {
  logs: OrgAuditLogRow[];
  meta?: PaginationMeta;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const isShortenableId = (val: string): boolean => {
  if (!val) return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
    return true;
  }
  if (/^[a-z0-9_-]{20,}$/i.test(val)) {
    return true;
  }
  return false;
};

const getActionVariant = (
  action: string,
): {
  variant: "soft" | "success" | "warning" | "danger" | "neutral";
  dotColor: string;
} => {
  const upper = action.toUpperCase();
  if (
    upper.includes("REVOKE") ||
    upper.includes("DELETE") ||
    upper.includes("REMOVE") ||
    upper.includes("SUSPEND") ||
    upper.includes("DISABLE")
  ) {
    return { variant: "danger", dotColor: "bg-[var(--gy-danger)]" };
  }
  if (
    upper.includes("CREATE") ||
    upper.includes("INVITE") ||
    upper.includes("ADD") ||
    upper.includes("ENABLE") ||
    upper.includes("GRANT")
  ) {
    return { variant: "success", dotColor: "bg-[var(--gy-success)]" };
  }
  if (
    upper.includes("UPDATE") ||
    upper.includes("CHANGE") ||
    upper.includes("EDIT") ||
    upper.includes("MODIFY")
  ) {
    return { variant: "warning", dotColor: "bg-[var(--gy-warning)]" };
  }
  return { variant: "neutral", dotColor: "bg-[var(--gy-text-subtle)]" };
};

const COLUMNS: Column<OrgAuditLogRow>[] = [
  {
    key: "action",
    header: "Action",
    width: "250px",
    accessor: (log) => {
      const { variant, dotColor } = getActionVariant(log.action);
      return (
        <div className="flex items-center min-w-0">
          <Chip
            size="xs"
            variant={variant}
            radius="md"
            className="font-mono font-semibold"
            icon={<div className={`size-1.5 shrink-0 rounded-full ${dotColor}`} />}
          >
            {log.action}
          </Chip>
        </div>
      );
    },
  },
  {
    key: "actor",
    header: "Actor",
    width: "220px",
    accessor: (log) => (
      <div
        className="flex items-center gap-2 min-w-0"
        title={log.actorEmail || "System automation"}
      >
        <User className="size-3.5 shrink-0 text-[var(--gy-text-subtle)]" />
        <Typography
          variant="span"
          textColor="var(--gy-text-secondary)"
          className="truncate max-w-[180px] text-xs"
        >
          {log.actorEmail || "System automation"}
        </Typography>
      </div>
    ),
  },
  {
    key: "resource",
    header: "Resource / scope",
    width: "220px",
    accessor: (log) => {
      const target = log.target || "Organization";
      const isId = isShortenableId(target);
      const displayText = isId
        ? `${target.slice(0, 8)}…${target.slice(-4)}`
        : target;

      return (
        <div className="flex items-center min-w-0" title={target}>
          <Chip
            size="xs"
            variant="neutral"
            radius="md"
            className="max-w-[200px]"
          >
            <Typography
              variant="span"
              className={`truncate block max-w-[170px] text-xs ${
                isId ? "font-mono text-[11px]" : ""
              }`}
            >
              {displayText}
            </Typography>
          </Chip>
        </div>
      );
    },
  },
  {
    key: "timestamp",
    header: "Timestamp",
    width: "180px",
    accessor: (log) => (
      <Typography
        variant="span"
        textColor="var(--gy-text-secondary)"
        className="whitespace-nowrap font-mono text-[11px]"
      >
        {formatTimestamp(log.createdAt)}
      </Typography>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "110px",
    align: "right",
    headerAlign: "right",
    accessor: () => (
      <div className="flex justify-end">
        <Chip
          size="xs"
          variant="success"
          radius="full"
          icon={<CheckCircle2 className="size-3.5" />}
        >
          Success
        </Chip>
      </div>
    ),
  },
];

export const AuditLogsTable = ({ logs, meta, loading, onPageChange }: AuditLogsTableProps) => {
  return (
    <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
      <Table<OrgAuditLogRow>
        columns={COLUMNS}
        data={logs}
        rowKey={(log) => log.id}
        hoverable
        size="sm"
        isLoading={loading}
        skeletonRows={6}
        pagination={tablePagination(meta)}
        onPageChange={onPageChange}
      />
    </div>
  );
};
