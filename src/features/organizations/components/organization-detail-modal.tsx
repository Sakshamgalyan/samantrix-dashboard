"use client";

import type React from "react";
import { Button, Chip, Modal, Skeleton } from "@galyan/ui";
import { Ban, PlayCircle, Receipt, Users } from "lucide-react";
import { GLASS_ROW, SectionEmpty } from "@/components/admin";
import { formatDate, formatMoney, relativeTime, titleCase } from "@/lib/format";
import { useOrganizationsContext } from "../context";
import type { AdminOrganizationDetail } from "../types";
import {
  CAN_ACTIVATE,
  CAN_SUSPEND,
  PLAN_META,
  STATUS_META,
  initials,
} from "../common/constants";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={`${GLASS_ROW} min-w-0 px-3 py-2.5`}>
      <div className="text-[11px] uppercase tracking-wide text-[var(--gy-text-subtle)]">
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm text-[var(--gy-text)]">
        {value}
      </div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 text-sm font-semibold text-[var(--gy-text)]">
      {children}
    </h4>
  );
}

function DetailBody({ org }: { org: AdminOrganizationDetail }) {
  const location = [org.city, org.state, org.country]
    .filter(Boolean)
    .join(", ");
  const sub = org.subscription;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip size="sm" variant={STATUS_META[org.status]?.variant ?? "neutral"}>
          {STATUS_META[org.status]?.label ?? titleCase(org.status)}
        </Chip>
        <Chip size="sm" variant={PLAN_META[org.planTier]?.variant ?? "neutral"}>
          {PLAN_META[org.planTier]?.label ?? titleCase(org.planTier)} ·{" "}
          {titleCase(org.billingCycle)}
        </Chip>
        {org.industry && (
          <Chip size="sm" variant="outline">
            {org.industry}
          </Chip>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Fact
          label="Owner"
          value={
            <>
              {org.owner.fullName}{" "}
              <span className="text-[var(--gy-text-secondary)]">
                · {org.owner.email}
              </span>
            </>
          }
        />
        <Fact
          label="Created"
          value={`${formatDate(org.createdAt)} (${relativeTime(org.createdAt)})`}
        />
        <Fact
          label="Seats"
          value={`${org.memberCount} of ${org.maxMembers} members · ${org.invitationCount} invitations`}
        />
        <Fact label="Workspace limit" value={org.maxWorkspaces} />
        {location && <Fact label="Location" value={location} />}
        {org.companySize && (
          <Fact label="Company size" value={org.companySize} />
        )}
        {org.website && <Fact label="Website" value={org.website} />}
        {org.businessEmail && (
          <Fact label="Business email" value={org.businessEmail} />
        )}
        {org.legalName && <Fact label="Legal name" value={org.legalName} />}
        {org.domain && <Fact label="Domain" value={org.domain} />}
      </div>

      <div>
        <SubHeading>Subscription</SubHeading>
        {sub ? (
          <div
            className={`${GLASS_ROW} grid gap-3 px-3 py-3 text-sm sm:grid-cols-3`}
          >
            <div>
              <div className="text-[11px] text-[var(--gy-text-subtle)]">
                Amount
              </div>
              <div className="font-medium text-[var(--gy-text)]">
                {formatMoney(sub.amount, sub.currency, 2)} /
                {org.billingCycle === "YEARLY" ? "yr" : "mo"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--gy-text-subtle)]">
                Status
              </div>
              <div className="text-[var(--gy-text)]">
                {titleCase(sub.status)}
                {sub.cancelAtPeriodEnd && " · cancels at period end"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--gy-text-subtle)]">
                Current period ends
              </div>
              <div className="text-[var(--gy-text)]">
                {formatDate(sub.currentPeriodEnd)}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`${GLASS_ROW} px-3 py-2.5 text-sm text-[var(--gy-text-secondary)]`}
          >
            This organization has no subscription record.
          </div>
        )}
      </div>

      <div>
        <SubHeading>
          Members{" "}
          <span className="font-normal text-[var(--gy-text-subtle)]">
            · {org.memberCount}
          </span>
        </SubHeading>
        {org.members.length === 0 ? (
          <SectionEmpty
            icon={<Users className="size-5" />}
            title="No members"
            description="Nobody has joined this organization yet."
          />
        ) : (
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {org.members.map((m) => (
              <div
                key={m.id}
                className={`${GLASS_ROW} flex items-center justify-between gap-3 px-3 py-2`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--gy-primary)]/12 text-[10px] font-semibold text-[var(--gy-primary)]">
                    {initials(m.fullName)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm text-[var(--gy-text)]">
                      {m.fullName}
                    </div>
                    <div className="truncate text-xs text-[var(--gy-text-secondary)]">
                      {m.email}
                      {m.jobTitle ? ` · ${m.jobTitle}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Chip size="sm" variant="soft">
                    {titleCase(m.role)}
                  </Chip>
                  {m.status !== "ACTIVE" && (
                    <Chip size="sm" variant="warning">
                      {titleCase(m.status)}
                    </Chip>
                  )}
                </div>
              </div>
            ))}
            {org.memberCount > org.members.length && (
              <p className="pt-1 text-xs text-[var(--gy-text-subtle)]">
                Showing the first {org.members.length} of {org.memberCount}{" "}
                members.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <SubHeading>
          Recent invoices{" "}
          <span className="font-normal text-[var(--gy-text-subtle)]">
            · {org.invoiceCount}
          </span>
        </SubHeading>
        {org.recentInvoices.length === 0 ? (
          <SectionEmpty
            icon={<Receipt className="size-5" />}
            title="No invoices"
            description="No invoice has been issued to this organization."
          />
        ) : (
          <div className="space-y-1.5">
            {org.recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className={`${GLASS_ROW} flex items-center justify-between gap-3 px-3 py-2 text-sm`}
              >
                <div className="min-w-0">
                  <div className="truncate text-[var(--gy-text)]">
                    {inv.invoiceNumber}
                  </div>
                  <div className="text-xs text-[var(--gy-text-subtle)]">
                    {formatDate(inv.createdAt)}
                    {inv.paidAt ? ` · paid ${formatDate(inv.paidAt)}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-medium text-[var(--gy-text)]">
                    {formatMoney(inv.amount, inv.currency, 2)}
                  </span>
                  <Chip
                    size="sm"
                    variant={
                      inv.status === "PAID"
                        ? "success"
                        : inv.status === "FAILED"
                          ? "danger"
                          : "neutral"
                    }
                  >
                    {titleCase(inv.status)}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrganizationDetailModal() {
  const { state, canManage, closeDetail, openDetail, openStatusDialog } =
    useOrganizationsContext();
  const detail = state.detail;
  const org = detail?.data ?? null;
  const listRow = state.data?.organizations.find((o) => o.id === detail?.orgId);

  const action =
    canManage && org && listRow
      ? CAN_SUSPEND.includes(org.status)
        ? ("SUSPENDED" as const)
        : CAN_ACTIVATE.includes(org.status)
          ? ("ACTIVE" as const)
          : null
      : null;

  return (
    <Modal
      variant="glass"
      isOpen={detail !== null}
      onClose={closeDetail}
      size="lg"
      title={org?.name ?? listRow?.name ?? "Organization"}
      subtitle={org?.slug ?? listRow?.slug}
      footer={
        <div className="flex justify-end gap-2">
          {action && listRow && (
            <Button
              variant={action === "SUSPENDED" ? "danger-soft" : "success"}
              size="sm"
              leftIcon={
                action === "SUSPENDED" ? (
                  <Ban className="size-3.5" />
                ) : (
                  <PlayCircle className="size-3.5" />
                )
              }
              onClick={() => openStatusDialog(listRow, action)}
            >
              {action === "SUSPENDED" ? "Suspend" : "Activate"}
            </Button>
          )}
          <Button variant="glass" size="sm" onClick={closeDetail}>
            Close
          </Button>
        </div>
      }
    >
      {detail?.loading && !org ? (
        <div className="space-y-3">
          <Skeleton height="28px" width="60%" />
          <div className="grid gap-2 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height="56px" />
            ))}
          </div>
          <Skeleton height="120px" />
        </div>
      ) : detail?.error && !org ? (
        <div
          className={`${GLASS_ROW} flex items-center justify-between gap-3 px-3 py-3 text-sm text-[var(--gy-text-secondary)]`}
        >
          <span>{detail.error}</span>
          <Button
            variant="glass"
            size="xs"
            onClick={() => openDetail(detail.orgId)}
          >
            Try again
          </Button>
        </div>
      ) : org ? (
        <DetailBody org={org} />
      ) : null}
    </Modal>
  );
}
