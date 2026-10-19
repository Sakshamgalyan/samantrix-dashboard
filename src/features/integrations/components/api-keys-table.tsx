"use client";

import React, { useState } from "react";
import { Button, Chip, Table, Typography, useToast, type Column } from "@galyan/ui";
import { Calendar, Check, Clock, Copy, KeyRound, ShieldAlert, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/format";
import { tablePagination, type PaginationMeta } from "@/features/common/pagination";
import type { OrgApiKeyRow } from "@/features/integrations/types/api";

export interface ApiKeysTableProps {
  apiKeys: OrgApiKeyRow[];
  meta?: PaginationMeta;
  loading: boolean;
  canEdit: boolean;
  onRevoke: (key: OrgApiKeyRow) => void;
  onPageChange: (page: number) => void;
}

export const ApiKeysTable = ({
  apiKeys,
  meta,
  loading,
  canEdit,
  onRevoke,
  onPageChange,
}: ApiKeysTableProps) => {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrefix = (key: OrgApiKeyRow) => {
    navigator.clipboard.writeText(key.keyPrefix);
    setCopiedId(key.id);
    toast.success(`Copied key prefix: ${key.keyPrefix}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: Column<OrgApiKeyRow>[] = [
    {
      key: "name",
      header: "Key Name & Identifier",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
            <KeyRound className="size-4" />
          </div>
          <div className="min-w-0">
            <Typography
              variant="span"
              weight="semibold"
              textColor="var(--gy-text)"
              className="truncate block text-xs sm:text-sm"
            >
              {row.name}
            </Typography>
            <Typography
              variant="span"
              textColor="var(--gy-text-subtle)"
              className="text-[11px] font-mono"
            >
              ID: {row.id.slice(0, 8)}…
            </Typography>
          </div>
        </div>
      ),
    },
    {
      key: "prefix",
      header: "Key Prefix",
      accessor: (row) => (
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] px-2.5 py-1">
          <Typography
            variant="span"
            className="font-mono text-xs font-medium text-[var(--gy-text)]"
          >
            {row.keyPrefix}••••••••
          </Typography>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-auto p-0.5 text-[var(--gy-text-secondary)] hover:text-[var(--gy-text)]"
            onClick={() => handleCopyPrefix(row)}
            title="Copy Key Prefix"
            aria-label="Copy Key Prefix"
          >
            {copiedId === row.id ? (
              <Check className="size-3 text-[var(--gy-success)]" />
            ) : (
              <Copy className="size-3" />
            )}
          </Button>
        </div>
      ),
    },
    {
      key: "created",
      header: "Created On",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[var(--gy-text-secondary)]">
          <Calendar className="size-3.5 shrink-0 text-[var(--gy-text-subtle)]" />
          <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-xs">
            {formatDate(row.createdAt)}
          </Typography>
        </div>
      ),
    },
    {
      key: "lastUsed",
      header: "Last Active",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="size-3.5 shrink-0 text-[var(--gy-text-subtle)]" />
          <Typography
            variant="span"
            textColor={row.lastUsedAt ? "var(--gy-text)" : "var(--gy-text-subtle)"}
            className="text-xs"
          >
            {row.lastUsedAt ? formatDate(row.lastUsedAt) : "Never used"}
          </Typography>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: () => (
        <Chip size="xs" variant="success" className="font-medium">
          Active
        </Chip>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      accessor: (row) =>
        canEdit ? (
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Trash2 className="size-3.5 text-[var(--gy-danger)]" />}
            onClick={() => onRevoke(row)}
            aria-label={`Revoke ${row.name}`}
            className="text-[var(--gy-danger)] hover:bg-[var(--gy-danger)]/10 transition-colors"
          >
            Revoke
          </Button>
        ) : (
          <div className="flex items-center justify-end text-[var(--gy-text-subtle)]" title="Read only access">
            <ShieldAlert className="size-4" />
          </div>
        ),
    },
  ];

  return (
    <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
      <Table<OrgApiKeyRow>
        columns={columns}
        data={apiKeys}
        rowKey={(row: OrgApiKeyRow) => row.id}
        hoverable
        size="sm"
        isLoading={loading}
        skeletonRows={4}
        pagination={tablePagination(meta)}
        onPageChange={onPageChange}
      />
    </div>
  );
};
