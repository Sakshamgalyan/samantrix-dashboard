"use client";

import React, { useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth";
import { queryErrorMessage } from "@/store";
import { pageParams } from "@/features/common/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Banner,
  Button,
  Card,
  Chip,
  Dropdown,
  EmptyState,
  Input,
  Typography,
  useToast,
} from "@galyan/ui";
import { FileText, RotateCw, Search, ShieldCheck, Trash2 } from "lucide-react";
import {
  useGetOrgAuditLogsQuery,
  useClearOrgAuditLogsMutation,
} from "@/features/audit-logs/context/api";
import { ACTION_OPTIONS } from "@/features/audit-logs/common/constants";
import { useAuditLogs } from "@/features/audit-logs/context";
import {
  setSearchAction,
  setActionFilterAction,
  setAuditPageAction,
  resetFiltersAction,
  setClearModalOpenAction,
  setClearingAction,
} from "@/features/audit-logs/context/action";
import { AuditLogsTable } from "@/features/audit-logs/components/audit-logs-table";
import { DeleteModal } from "@/components/common/delete-modal";

export const AuditLogsContent = () => {
  const { isOwner, isAdmin, user } = useAuth();
  const { toast } = useToast();
  const canClear = isOwner || isAdmin || user?.platformRole === "SUPERADMIN";

  const { state, dispatch } = useAuditLogs();
  const { searchQuery, actionFilter, page, isClearModalOpen, isClearing } = state;

  const debouncedSearch = useDebounce(searchQuery, 300);

  const queryParams = useMemo(
    () =>
      pageParams(page, {
        search: debouncedSearch || undefined,
        action: actionFilter !== "ALL" ? actionFilter : undefined,
      }),
    [page, debouncedSearch, actionFilter],
  );

  const { data, isLoading, isFetching, error, refetch } = useGetOrgAuditLogsQuery(queryParams);
  const [clearAuditLogs] = useClearOrgAuditLogsMutation();

  const logs = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const errorMessage = error ? queryErrorMessage(error, "Failed to load audit logs.") : null;

  const handleConfirmClear = useCallback(async () => {
    dispatch(setClearingAction(true));
    try {
      const res = await clearAuditLogs().unwrap();
      const count = res?.clearedCount ?? 0;
      toast.success(
        count > 0
          ? `Successfully cleared ${count} audit log${count === 1 ? "" : "s"}.`
          : "Audit logs cleared successfully.",
      );
      dispatch(setClearModalOpenAction(false));
      void refetch();
    } catch (err) {
      toast.error(queryErrorMessage(err, "Failed to clear audit logs."));
    } finally {
      dispatch(setClearingAction(false));
    }
  }, [clearAuditLogs, dispatch, refetch, toast]);

  return (
    <div className="space-y-5">
      {/* Elevated Hero Header */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="soft" size="sm" icon={<ShieldCheck className="size-3" />}>
                Audit Trail
              </Chip>
              <Chip variant="neutral" size="sm">
                {total} recorded event{total === 1 ? "" : "s"}
              </Chip>
              <Chip variant="success" size="sm">
                Immutable Ledger
              </Chip>
            </div>
            <Typography
              variant="h3"
              weight="bold"
              textColor="var(--gy-text)"
              className="text-lg sm:text-xl xl:text-2xl tracking-tight"
            >
              Audit Logs &amp; Security Trail
            </Typography>
            <Typography
              variant="p"
              textColor="var(--gy-text-secondary)"
              className="max-w-2xl text-xs sm:text-sm leading-relaxed"
            >
              Immutable trail of team membership modifications, role assignments, authentication events, and administrative security changes.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />}
              disabled={isFetching}
              onClick={() => void refetch()}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>
            {canClear && (
              <Button
                variant="danger-soft"
                size="sm"
                leftIcon={<Trash2 className="size-3.5" />}
                onClick={() => dispatch(setClearModalOpenAction(true))}
                disabled={total === 0 || isLoading || isClearing}
                className="flex-1 sm:flex-initial"
              >
                Clear Audit Logs
              </Button>
            )}
          </div>
        </div>
      </Card>

      {errorMessage && (
        <Banner
          variant="danger"
          size="sm"
          bannerStyle="subtle"
          title="Could not load audit logs"
          description={errorMessage}
          button={
            <Button variant="danger-soft" size="xs" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Filter Toolbar Card */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              size="sm"
              placeholder="Filter by action, actor email, or resource..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchAction(e.target.value))}
              leftIcon={<Search className="size-4" />}
            />
          </div>
          <div className="w-full sm:w-60">
            <Dropdown
              size="sm"
              options={ACTION_OPTIONS}
              value={actionFilter}
              onChange={(v) => dispatch(setActionFilterAction(v as string))}
            />
          </div>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card
        variant="elevated"
        radius="xl"
        padding="md"
        className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs"
      >
        {logs.length === 0 && !isLoading ? (
          <EmptyState
            variant="glass"
            size="sm"
            icon={<FileText className="size-8" />}
            title="No audit logs match"
            description={
              searchQuery || actionFilter !== "ALL"
                ? "Try clearing the search query or selecting 'All event types'."
                : "Administrative actions performed by your team will appear here."
            }
            action={
              searchQuery || actionFilter !== "ALL" ? (
                <Button variant="secondary" size="sm" onClick={() => dispatch(resetFiltersAction())}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <AuditLogsTable
            logs={logs}
            meta={meta}
            loading={isLoading}
            onPageChange={(p) => dispatch(setAuditPageAction(p))}
          />
        )}
      </Card>

      {/* Clear Audit Logs Confirmation Modal */}
      <DeleteModal
        isOpen={isClearModalOpen}
        onClose={() => dispatch(setClearModalOpenAction(false))}
        onConfirm={handleConfirmClear}
        title="Clear Organization Audit Logs"
        itemType="audit logs"
        description="Are you sure you want to permanently clear all audit trail records for this organization? All recorded security, membership, and administrative logs will be purged."
        warningMessage="This action cannot be undone. Cleared events cannot be recovered for security investigations or compliance audits."
        confirmText="Clear All Logs"
        isDeleting={isClearing}
        loadingText="Clearing Logs..."
      />
    </div>
  );
};
