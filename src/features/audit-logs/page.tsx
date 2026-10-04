"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api, ApiError } from "@/lib/api";
import { OrgAuditLog } from "@/types/dashboard";
import {
  Banner,
  Button,
  Card,
  Chip,
  Dropdown,
  EmptyState,
  Input,
  Skeleton,
  Table,
  Typography,
  type Column,
} from "@galyan/ui";
import { FileText, Search, User, RefreshCw, CheckCircle2 } from "lucide-react";

type AuditLogsResponse = OrgAuditLog[] | { data?: OrgAuditLog[] } | null | undefined;

const ACTION_OPTIONS = [
  { value: "ALL", label: "All event types" },
  { value: "USER", label: "User events" },
  { value: "AUTH", label: "Authentication events" },
  { value: "FEATURE", label: "Feature changes" },
  { value: "SECURITY", label: "Security changes" },
  { value: "ORG", label: "Organization events" },
];

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const COLUMNS: Column<OrgAuditLog>[] = [
  {
    key: "action",
    header: "Action",
    accessor: (log) => (
      <div className="flex items-center gap-2.5">
        <span className="size-2 shrink-0 rounded-full bg-[var(--gy-primary)]" />
        <span className="font-mono text-xs font-semibold text-[var(--gy-text)]">{log.action}</span>
      </div>
    ),
  },
  {
    key: "actor",
    header: "Actor",
    accessor: (log) => (
      <div className="flex items-center gap-2 text-[var(--gy-text-secondary)]">
        <User className="size-3.5 shrink-0 text-[var(--gy-text-subtle)]" />
        <span>{log.actorEmail || "System automation"}</span>
      </div>
    ),
  },
  {
    key: "resource",
    header: "Resource / scope",
    accessor: (log) => (
      <Chip size="sm" variant="neutral" radius="md">
        {log.resource || "Organization"}
      </Chip>
    ),
  },
  {
    key: "timestamp",
    header: "Timestamp",
    accessor: (log) => (
      <span className="text-[var(--gy-text-secondary)]">{formatTimestamp(log.createdAt)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "right",
    headerAlign: "right",
    accessor: () => (
      <Chip size="sm" variant="success" icon={<CheckCircle2 className="size-3.5" />}>
        Success
      </Chip>
    ),
  },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<OrgAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = useCallback(
    () =>
      api
        .get<AuditLogsResponse>("/organizations/me/audit-logs")
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setError(null);
          setLogs(list);
        })
        .catch((err: unknown) => {
          setError(err instanceof ApiError ? err.message : "Failed to load audit logs.");
        })
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return logs.filter((log) => {
      const matchesSearch =
        (log.action || "").toLowerCase().includes(q) ||
        (log.actorEmail || "").toLowerCase().includes(q) ||
        (log.resource || "").toLowerCase().includes(q);

      const matchesAction = actionFilter === "ALL" || log.action.startsWith(actionFilter);
      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Typography variant="p" className="text-sm text-[var(--gy-text-secondary)]">
            Immutable tenant event trail tracking user actions, security changes and administrative operations.
          </Typography>
          <Chip size="sm" variant="soft">
            {logs.length} events
          </Chip>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="size-3.5" />}
          onClick={() => void fetchLogs()}
        >
          Refresh trail
        </Button>
      </div>

      {error && (
        <Banner
          variant="danger"
          description={error}
          button={
            <Button variant="danger-soft" size="sm" onClick={() => void fetchLogs()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Filters */}
      <Card variant="default" padding="md" radius="lg">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              type="text"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor or target resource..."
              aria-label="Search audit logs"
              leftIcon={<Search className="size-4" />}
              clearable
              onClear={() => setSearchQuery("")}
            />
          </div>
          <div className="w-full sm:w-60">
            <Dropdown
              options={ACTION_OPTIONS}
              value={actionFilter}
              onChange={setActionFilter}
              placeholder="All event types"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card variant="default" padding="none" radius="xl" className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height="2.5rem" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            size="md"
            icon={<FileText className="size-8" />}
            title="No audit records found"
            description="Security-sensitive operations performed by team members are recorded here."
          />
        ) : (
          <Table<OrgAuditLog>
            columns={COLUMNS}
            data={filteredLogs}
            rowKey={(log) => log.id}
            hoverable
            noBorder
            emptyStateLabel="No audit records found"
          />
        )}
      </Card>
    </div>
  );
}
