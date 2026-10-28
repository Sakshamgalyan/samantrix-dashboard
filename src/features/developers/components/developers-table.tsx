"use client";

import { useMemo } from "react";
import {
  Button,
  Chip,
  Menu,
  Table,
  Tooltip,
  type Column,
  type MenuItem,
} from "@galyan/ui";
import {
  CheckCircle2,
  Lock,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  ShieldBan,
  ShieldCheck,
  Trash2,
  UserCog,
  XCircle,
} from "lucide-react";
import { tablePagination } from "@/features/common/pagination";
import { formatDate, relativeTime } from "@/utils/format";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMounted } from "@/hooks/use-mounted";
import { useDevelopersContext } from "@/features/developers/context";
import {
  ROLE_CHIP,
  STATUS_META,
  roleLabel,
} from "@/features/developers/common/constants";
import type {
  DeveloperAccount,
  DeveloperDialogKind,
} from "@/features/developers/types";

const ICON = "size-3.5";

/** Menu entries for a row, by account status. */
function menuItems(dev: DeveloperAccount): MenuItem[] {
  switch (dev.status) {
    case "PENDING_VERIFICATION":
      return [
        {
          id: "approve",
          label: "Approve…",
          icon: <CheckCircle2 className={ICON} />,
        },
        { id: "reject", label: "Reject", icon: <XCircle className={ICON} /> },
        { id: "delete", label: "Delete", icon: <Trash2 className={ICON} /> },
      ];
    case "INACTIVE":
      return [
        {
          id: "reinstate",
          label: "Reinstate…",
          icon: <ShieldCheck className={ICON} />,
        },
        { id: "delete", label: "Delete", icon: <Trash2 className={ICON} /> },
      ];
    default:
      return [
        {
          id: "edit",
          label: "Edit details",
          icon: <Pencil className={ICON} />,
        },
        {
          id: "role",
          label: "Change role",
          icon: <UserCog className={ICON} />,
        },
        dev.status === "SUSPENDED"
          ? {
              id: "reactivate",
              label: "Reactivate",
              icon: <ShieldCheck className={ICON} />,
            }
          : {
              id: "suspend",
              label: "Suspend",
              icon: <ShieldBan className={ICON} />,
            },
        {
          id: "delete",
          label: "Delete",
          icon: <Trash2 className={ICON} />,
          divider: true,
        },
      ];
  }
}

function RowActions({ row }: { row: DeveloperAccount }) {
  const { permissionsFor, openDialog } = useDevelopersContext();
  const { canManage, reason } = permissionsFor(row);

  if (!canManage) {
    return reason ? (
      <Tooltip content={reason} position="left" size="sm">
        <span className="inline-flex size-7 items-center justify-center text-[var(--gy-text-subtle)]">
          <Lock className="size-3.5" />
        </span>
      </Tooltip>
    ) : null;
  }

  return (
    <Menu
      items={menuItems(row)}
      size="sm"
      variant="default"
      placement="bottom-end"
      width={180}
      onItemClick={(id) =>
        openDialog({ kind: id as DeveloperDialogKind, dev: row })
      }
      trigger={
        <Button
          variant="ghost"
          size="xs"
          leftIcon={<MoreVertical className="size-4" />}
          aria-label={`Actions for ${row.fullName}`}
        />
      }
    />
  );
}

export function DevelopersTable() {
  const { state, setPage, currentUserId } = useDevelopersContext();
  const isMounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const showFullColumns = !isMounted || isDesktop;

  const columns: Column<DeveloperAccount>[] = useMemo(() => {
    return [
      {
        key: "fullName",
        width: showFullColumns ? "260px" : "200px",
        header: "Developer",
        accessor: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/12 text-xs font-semibold text-[var(--gy-primary)]">
              {row.fullName.slice(0, 2).toUpperCase()}
              {row.online && (
                <span
                  className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[var(--gy-success)] ring-2 ring-[var(--gy-surface)]"
                  aria-label="Online"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="truncate text-sm font-medium text-[var(--gy-text)]">
                  {row.fullName}
                </span>
                {row.id === currentUserId && (
                  <Chip size="xs" variant="soft">
                    You
                  </Chip>
                )}
              </div>
              <div className="truncate text-xs text-[var(--gy-text-secondary)]">
                {row.email}
              </div>
              {!showFullColumns && (
                <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-[var(--gy-text-subtle)]">
                  {row.online ? (
                    <span className="inline-flex items-center gap-1 font-medium text-[var(--gy-success)]">
                      <span className="size-1.5 rounded-full bg-[var(--gy-success)]" />
                      Online
                    </span>
                  ) : row.lastSignInAt ? (
                    <span>{relativeTime(row.lastSignInAt)}</span>
                  ) : (
                    <span>Joined {formatDate(row.createdAt)}</span>
                  )}
                  {row.phone && <span>· {row.phone}</span>}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "platformRole",
        width: showFullColumns ? "120px" : "100px",
        header: "Role",
        accessor: (row) => (
          <Chip size="sm" variant={ROLE_CHIP[row.platformRole] ?? "neutral"}>
            {roleLabel(row.platformRole)}
          </Chip>
        ),
      },
      {
        key: "status",
        width: showFullColumns ? "110px" : "90px",
        header: "Status",
        accessor: (row) => (
          <Chip
            size="sm"
            variant={STATUS_META[row.status]?.variant ?? "neutral"}
          >
            {STATUS_META[row.status]?.label ?? row.status}
          </Chip>
        ),
      },
      {
        key: "organizations",
        width: showFullColumns ? "180px" : "140px",
        header: "Organization",
        accessor: (row) => {
          const orgs = row.organizations || [];
          if (orgs.length === 0) {
            return (
              <span className="text-xs text-[var(--gy-text-subtle)]">—</span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1 items-center">
              {orgs.map((org) => (
                <Chip
                  key={org.id}
                  size="xs"
                  variant={org.isOwner ? "primary" : "neutral"}
                >
                  {org.name} {org.isOwner ? "(Owner)" : `(${org.role})`}
                </Chip>
              ))}
            </div>
          );
        },
      },
      ...(showFullColumns
        ? [
            {
              key: "lastSignInAt",
              width: "170px",
              header: "Last sign-in",
              accessor: (row: DeveloperAccount) =>
                row.lastSignInAt ? (
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--gy-text)]">
                      {row.online && (
                        <span className="size-1.5 rounded-full bg-[var(--gy-success)]" />
                      )}
                      {row.online
                        ? "Online now"
                        : relativeTime(row.lastSignInAt)}
                    </div>
                    {row.lastDevice && (
                      <div className="truncate text-[var(--gy-text-subtle)]">
                        {row.lastDevice}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-[var(--gy-text-subtle)]">
                    Never
                  </span>
                ),
            },
            {
              key: "createdAt",
              width: "110px",
              header: "Joined",
              accessor: (row: DeveloperAccount) => (
                <span className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]">
                  {formatDate(row.createdAt)}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "actions",
        width: "52px",
        header: "",
        align: "right",
        fixed: "right",
        accessor: (row) => (
          <div className="flex justify-end">
            <RowActions row={row} />
          </div>
        ),
      },
    ];
  }, [showFullColumns, currentUserId]);

  return (
    <div className="w-full overflow-x-auto">
      <Table<DeveloperAccount>
        columns={columns}
        data={state.rows}
        rowKey={(row) => row.id}
        hoverable
        size="sm"
        isLoading={state.listLoading}
        pagination={tablePagination(state.meta)}
        onPageChange={setPage}
        fixedRightmost
        responsive="scroll"
        emptyStateLabel="No developers match"
        emptyStateMessage="Try another filter or search term."
      />
    </div>
  );
}
