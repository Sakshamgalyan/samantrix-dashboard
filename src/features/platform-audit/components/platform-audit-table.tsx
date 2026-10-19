"use client";

import React from "react";
import { Button, Card, Chip, EmptyState, Input, Skeleton, Typography } from "@galyan/ui";
import { Eye, FileText, Globe, Search, User } from "lucide-react";
import { usePlatformAudit } from "@/features/platform-audit/context";
import {
  openDetailModalAction,
  setCategoryFilterAction,
  setPageAction,
  setSearchQueryAction,
} from "@/features/platform-audit/context/action";
import type { PlatformAuditLog } from "@/features/platform-audit/types";

interface PlatformAuditTableProps {
  logs: PlatformAuditLog[];
  isLoading: boolean;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export const PlatformAuditTable = ({
  logs,
  isLoading,
  meta,
}: PlatformAuditTableProps) => {
  const { state, dispatch } = usePlatformAudit();
  const { searchQuery, categoryFilter, page } = state;

  const categories = ["ALL", "SECURITY", "AUTH", "WORKSPACE", "BILLING", "LEADS"];

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
      (log.actorName && log.actorName.toLowerCase().includes(q)) ||
      (log.target && log.target.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.includes(q))
    );
  });

  const getCategoryVariant = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case "SECURITY":
        return "danger";
      case "AUTH":
        return "warning";
      case "WORKSPACE":
        return "primary";
      case "BILLING":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <Card variant="glass" radius="lg" className="p-3.5 sm:p-4 space-y-4">
      {/* Search & Category Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72 shrink-0">
          <Input
            size="sm"
            placeholder="Search action, actor, IP..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQueryAction(e.target.value))}
            leftIcon={<Search className="size-3.5 text-[var(--gy-text-subtle)]" />}
            fullWidth
            aria-label="Search audit trail"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {categories.map((cat) => (
            <Chip
              key={cat}
              variant={categoryFilter === cat ? "primary" : "outline"}
              size="sm"
              clickable
              onClick={() => dispatch(setCategoryFilterAction(cat))}
              className="text-xs shrink-0 cursor-pointer uppercase font-mono"
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height="52px" className="rounded-lg" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-8 text-center">
          <EmptyState
            icon={<FileText className="size-6 text-[var(--gy-text-subtle)] mx-auto" />}
            title="No Audit Records Found"
            description="No audit trail events match the current category or search filters."
          />
        </div>
      ) : (
        <>
          {/* Mobile Friendly Card View (< md) */}
          <div className="block md:hidden space-y-2.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-[var(--gy-border)]/50 bg-[var(--gy-surface)]/30 hover:bg-[var(--gy-surface-hover)]/30 transition-colors space-y-2"
              >
                {/* Top: Actor & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-7 rounded-full bg-[var(--gy-bg-elevated)] border border-[var(--gy-border)] flex items-center justify-center text-[var(--gy-text-secondary)] shrink-0">
                      <User className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="truncate block">
                        {log.actorName || "User"}
                      </Typography>
                      <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-[10px] font-mono truncate block">
                        {log.actorEmail}
                      </Typography>
                    </div>
                  </div>
                  <Chip
                    variant={getCategoryVariant(log.category)}
                    size="xs"
                    className="text-[10px] uppercase font-mono shrink-0"
                  >
                    {log.category}
                  </Chip>
                </div>

                {/* Middle: Action Badge & Target */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="bg-[var(--gy-bg-elevated)] px-2 py-0.5 rounded border border-[var(--gy-border)]/70 font-mono text-xs text-[var(--gy-text)] font-semibold break-all">
                    {log.action}
                  </span>
                  {log.target && (
                    <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs truncate max-w-full">
                      {log.target}
                    </Typography>
                  )}
                </div>

                {/* Bottom: Origin IP, Timestamp & Inspect */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--gy-border)]/40 text-xs">
                  <div className="flex items-center gap-2 min-w-0 text-[11px] text-[var(--gy-text-subtle)]">
                    <span className="flex items-center gap-1 font-mono">
                      <Globe className="size-3 shrink-0 text-[var(--gy-text-subtle)]" />
                      {log.ipAddress || "127.0.0.1"}
                    </span>
                    <span>·</span>
                    <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </div>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => dispatch(openDetailModalAction(log))}
                    className="text-xs px-2.5 shrink-0"
                  >
                    <Eye className="size-3 mr-1" />
                    Inspect
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto w-full min-w-0 rounded-xl border border-[var(--gy-border)]/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--gy-bg-elevated)] text-[var(--gy-text-secondary)] border-b border-[var(--gy-border)]/60">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Actor</th>
                  <th className="py-2.5 px-3 font-medium">Action Event</th>
                  <th className="py-2.5 px-3 font-medium">Category</th>
                  <th className="py-2.5 px-3 font-medium">Target Resource</th>
                  <th className="py-2.5 px-3 font-medium">Origin IP</th>
                  <th className="py-2.5 px-3 font-medium">Timestamp</th>
                  <th className="py-2.5 px-3 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gy-border)]/40">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--gy-surface-hover)]/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-[var(--gy-bg-elevated)] border border-[var(--gy-border)] flex items-center justify-center text-[var(--gy-text-secondary)] shrink-0">
                          <User className="size-3" />
                        </div>
                        <div className="truncate max-w-[140px]">
                          <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="truncate block">
                            {log.actorName || "User"}
                          </Typography>
                          <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-[10px] font-mono truncate block">
                            {log.actorEmail}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-[var(--gy-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--gy-border)]/60 font-mono text-[11px] text-[var(--gy-text)] font-semibold inline-block">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Chip
                        variant={getCategoryVariant(log.category)}
                        size="sm"
                        className="text-[10px] uppercase font-mono"
                      >
                        {log.category}
                      </Chip>
                    </td>
                    <td className="py-2.5 px-3 max-w-[180px] truncate">
                      <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate block">
                        {log.target || "Resource"}
                      </Typography>
                    </td>
                    <td className="py-2.5 px-3">
                      <Typography variant="small" textColor="var(--gy-text-subtle)" className="font-mono text-[11px]">
                        {log.ipAddress || "127.0.0.1"}
                      </Typography>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-[11px]">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => dispatch(openDetailModalAction(log))}
                        className="text-xs px-2.5"
                      >
                        <Eye className="size-3 mr-1" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Responsive Pagination Footer */}
      {meta && meta.totalPages > 1 && (
        <div className="pt-3 border-t border-[var(--gy-border)]/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-center sm:text-left">
            Page {meta.page} of {meta.totalPages} ({meta.total} records total)
          </Typography>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => dispatch(setPageAction(page - 1))}
              className="text-xs px-3"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => dispatch(setPageAction(page + 1))}
              className="text-xs px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
