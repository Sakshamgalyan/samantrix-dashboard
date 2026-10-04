"use client";

import { Button, Chip, Table, Tooltip, type Column } from "@galyan/ui";
import {
  CheckCircle2,
  ShieldBan,
  ShieldCheck,
  UserCog,
  Wifi,
  XCircle,
} from "lucide-react";
import { formatDate, relativeTime } from "@/lib/format";
import { useDevelopersContext } from "../context";
import { STATUS_META, roleLabel } from "../common/constants";
import type { DeveloperAccount } from "../types";

function RowActions({ row }: { row: DeveloperAccount }) {
  const { currentUserId, actorIsSuperadmin, openDialog } =
    useDevelopersContext();
  const isSelf = row.id === currentUserId;
  const protectedSuper =
    row.platformRole === "SUPERADMIN" && !actorIsSuperadmin;
  const locked = isSelf || protectedSuper;

  if (row.status === "PENDING_VERIFICATION") {
    return (
      <>
        <Button
          variant="success"
          size="xs"
          leftIcon={<CheckCircle2 className="size-3" />}
          onClick={() => openDialog({ kind: "approve", dev: row })}
        >
          Approve
        </Button>
        <Button
          variant="danger-soft"
          size="xs"
          leftIcon={<XCircle className="size-3" />}
          onClick={() => openDialog({ kind: "reject", dev: row })}
        >
          Reject
        </Button>
      </>
    );
  }

  if (row.status === "ACTIVE") {
    const buttons = (
      <span className="flex gap-2">
        <Button
          variant="glass"
          size="xs"
          leftIcon={<UserCog className="size-3" />}
          disabled={locked}
          onClick={() => openDialog({ kind: "role", dev: row })}
        >
          Role
        </Button>
        <Button
          variant="danger-soft"
          size="xs"
          leftIcon={<ShieldBan className="size-3" />}
          disabled={locked}
          onClick={() => openDialog({ kind: "revoke", dev: row })}
        >
          Revoke
        </Button>
      </span>
    );
    return locked ? (
      <Tooltip
        content={
          isSelf
            ? "You can't change your own access"
            : "Only a Superadmin can change a Superadmin"
        }
        position="left"
        size="sm"
      >
        {buttons}
      </Tooltip>
    ) : (
      buttons
    );
  }

  return (
    <Button
      variant="glass"
      size="xs"
      leftIcon={<ShieldCheck className="size-3" />}
      disabled={protectedSuper}
      onClick={() => openDialog({ kind: "reinstate", dev: row })}
    >
      Reinstate
    </Button>
  );
}

export function DevelopersTable() {
  const { visibleDevelopers, currentUserId } = useDevelopersContext();

  const columns: Column<DeveloperAccount>[] = [
    {
      key: "fullName",
      header: "Developer",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--gy-primary)]/12 text-xs font-semibold text-[var(--gy-primary)]">
            {row.fullName.slice(0, 2).toUpperCase()}
            {row.online && (
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[var(--gy-success)] ring-2 ring-[var(--gy-surface)]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-[var(--gy-text)]">
                {row.fullName}
              </span>
              {row.id === currentUserId && (
                <Chip size="sm" variant="soft">
                  You
                </Chip>
              )}
            </div>
            <div className="truncate text-xs text-[var(--gy-text-secondary)]">
              {row.email}
            </div>
            <div className="truncate text-[11px] text-[var(--gy-text-subtle)]">
              Joined {formatDate(row.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      width: "130px",
      header: "Status",
      accessor: (row) => (
        <Chip size="sm" variant={STATUS_META[row.status]?.variant ?? "neutral"}>
          {STATUS_META[row.status]?.label ?? row.status}
        </Chip>
      ),
    },
    {
      key: "platformRole",
      width: "150px",
      header: "Role",
      accessor: (row) => (
        <span className="whitespace-nowrap text-sm text-[var(--gy-text)]">
          {roleLabel(row.platformRole)}
        </span>
      ),
    },
    {
      key: "security",
      width: "180px",
      header: "Security",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Chip size="sm" variant={row.isEmailVerified ? "success" : "warning"}>
            {row.isEmailVerified ? "Verified" : "Unverified"}
          </Chip>
          <Chip size="sm" variant={row.twoFactorEnabled ? "soft" : "neutral"}>
            {row.twoFactorEnabled ? "2FA on" : "No 2FA"}
          </Chip>
        </div>
      ),
    },
    {
      key: "lastSignInAt",
      width: "150px",
      header: "Last sign-in",
      accessor: (row) =>
        row.lastSignInAt ? (
          <div className="text-xs">
            <div className="flex items-center gap-1.5 text-[var(--gy-text)]">
              {row.online && (
                <Wifi className="size-3 text-[var(--gy-success)]" />
              )}
              {row.online ? "Online now" : relativeTime(row.lastSignInAt)}
            </div>
            {row.lastDevice && (
              <div className="text-[var(--gy-text-subtle)]">
                {row.lastDevice}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-[var(--gy-text-subtle)]">Never</span>
        ),
    },
    {
      key: "actions",
      width: "180px",
      header: "",
      align: "right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <RowActions row={row} />
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table<DeveloperAccount>
        columns={columns}
        data={visibleDevelopers}
        rowKey={(row) => row.id}
        hoverable
        size="md"
        emptyStateLabel="No developers match"
        emptyStateMessage="Try another tab or search term."
      />
    </div>
  );
}
