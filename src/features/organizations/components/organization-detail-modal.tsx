"use client";

import type React from "react";
import { useState } from "react";
import { Button, Chip, Modal, Skeleton } from "@galyan/ui";
import {
  Ban,
  CreditCard,
  Pencil,
  PlayCircle,
  Receipt,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { pageParams } from "@/features/common/pagination";
import { formatDate, formatMoney, relativeTime, titleCase } from "@/utils/format";
import { useOrganizationsContext } from "@/features/organizations/context";
import { useGetOrganizationMembersQuery } from "@/features/organizations/context/api";
import type { AdminOrganizationDetail, OrganizationPaymentRow } from "@/features/organizations/types";
import {
  CAN_ACTIVATE,
  CAN_SUSPEND,
  PLAN_META,
  STATUS_META,
  initials,
  seatsOf,
} from "@/features/organizations/common/constants";

const PAYMENT_VARIANT: Record<
  OrganizationPaymentRow["status"],
  "success" | "danger" | "neutral" | "warning"
> = {
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "warning",
  CREATED: "neutral",
};

const Fact = ({ label, value }: { label: string; value: React.ReactNode }) => {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-[var(--gy-text-subtle)]">{label}</div>
      <div className="truncate text-sm text-[var(--gy-text)]">{value}</div>
    </div>
  );
};

const SubHeading = ({
  icon,
  children,
  count,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  count?: number;
}) => {
  return (
    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--gy-text)]">
      <span className="text-[var(--gy-text-subtle)] [&_svg]:size-3.5">
        {icon}
      </span>
      {children}
      {count !== undefined && (
        <span className="font-normal text-[var(--gy-text-subtle)]">
          · {count}
        </span>
      )}
    </h4>
  );
};

const Empty = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={`${GLASS_ROW} px-3 py-2 text-xs text-[var(--gy-text-secondary)]`}
    >
      {children}
    </div>
  );
};

/** One server page of members at a time (organizations can have many). */
const MembersSection = ({ orgId, memberCount }: { orgId: string; memberCount: number }) => {
  const [page, setPage] = useState(1);
  const { data, isFetching, isError } = useGetOrganizationMembersQuery({
    orgId,
    params: pageParams(page),
  });
  const members = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      <SubHeading icon={<Users />} count={memberCount}>
        Members
      </SubHeading>
      {!data ? (
        isError ? (
          <Empty>Couldn&apos;t load the members.</Empty>
        ) : (
          <Skeleton height="72px" />
        )
      ) : members.length === 0 ? (
        <Empty>Nobody has joined this organization yet.</Empty>
      ) : (
        <div className="space-y-1">
          {members.map((m) => (
            <div
              key={m.id}
              className={`${GLASS_ROW} flex items-center justify-between gap-3 px-3 py-1.5`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="grid size-6 shrink-0 place-items-center rounded-md bg-[var(--gy-primary)]/12 text-[10px] font-semibold text-[var(--gy-primary)]">
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
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-1 text-xs text-[var(--gy-text-subtle)]">
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>
              <div className="flex gap-1.5">
                <Button
                  size="xs"
                  disabled={!meta.hasPreviousPage || isFetching}
                  onClick={() => setPage(meta.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="xs"
                  disabled={!meta.hasNextPage || isFetching}
                  onClick={() => setPage(meta.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DetailBody = ({ org }: { org: AdminOrganizationDetail }) => {
  const address = [
    org.address,
    org.city,
    org.state,
    org.postalCode,
    org.country,
  ]
    .filter(Boolean)
    .join(", ");
  const sub = org.subscription;
  const { used, purchased } = seatsOf(org);

  const facts: [string, React.ReactNode][] = [
    ["Owner", `${org.owner.fullName} · ${org.owner.email}`],
    [
      "Created",
      `${formatDate(org.createdAt)} (${relativeTime(org.createdAt)})`,
    ],
    ["Seats", `${used} used of ${purchased}`],
    ["Workspace limit", org.maxWorkspaces],
  ];
  if (org.legalName) facts.push(["Legal name", org.legalName]);
  if (org.orgType) facts.push(["Type", org.orgType]);
  if (org.companySize) facts.push(["Company size", org.companySize]);
  if (org.businessEmail) facts.push(["Business email", org.businessEmail]);
  if (org.businessPhone) facts.push(["Business phone", org.businessPhone]);
  if (org.website) facts.push(["Website", org.website]);
  if (org.domain) facts.push(["Domain", org.domain]);
  if (org.taxId) facts.push(["GSTIN / Tax ID", org.taxId]);
  if (address) facts.push(["Address", address]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
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

      <div
        className={`${GLASS_ROW} grid gap-x-4 gap-y-2.5 px-3 py-3 sm:grid-cols-2`}
      >
        {facts.map(([label, value]) => (
          <Fact key={label} label={label} value={value} />
        ))}
      </div>

      {org.notes && (
        <div
          className={`${GLASS_ROW} whitespace-pre-wrap px-3 py-2 text-xs text-[var(--gy-text-secondary)]`}
        >
          {org.notes}
        </div>
      )}

      <div>
        <SubHeading icon={<CreditCard />}>Subscription</SubHeading>
        {sub ? (
          <div
            className={`${GLASS_ROW} grid grid-cols-2 gap-x-4 gap-y-2.5 px-3 py-3 sm:grid-cols-4`}
          >
            <Fact
              label="Amount"
              value={`${formatMoney(sub.amount, sub.currency, 2)}/${sub.billingCycle === "YEARLY" ? "yr" : "mo"}`}
            />
            <Fact label="Seats purchased" value={sub.seats} />
            <Fact
              label="Status"
              value={`${titleCase(sub.status)}${sub.cancelAtPeriodEnd ? " · cancels at period end" : ""}`}
            />
            <Fact
              label="Renews / ends"
              value={formatDate(sub.currentPeriodEnd)}
            />
            <Fact
              label="Source"
              value={
                sub.paymentProvider === "MANUAL"
                  ? "Assigned from the console"
                  : sub.paymentProvider
                    ? titleCase(sub.paymentProvider)
                    : "—"
              }
            />
            {sub.notes && (
              <div className="sm:col-span-3">
                <Fact label="Notes" value={sub.notes} />
              </div>
            )}
          </div>
        ) : (
          <Empty>
            No subscription yet. Use “Assign subscription” to give one.
          </Empty>
        )}
      </div>

      <div>
        <SubHeading icon={<Wallet />} count={org.paymentCount}>
          Payments
        </SubHeading>
        {org.recentPayments.length === 0 ? (
          <Empty>No payments recorded.</Empty>
        ) : (
          <div className="space-y-1">
            {org.recentPayments.map((p) => (
              <div
                key={p.id}
                className={`${GLASS_ROW} flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 text-sm`}
              >
                <div className="min-w-0">
                  <div className="truncate text-[var(--gy-text)]">
                    {titleCase(p.purpose)}
                    {p.planTier
                      ? ` · ${PLAN_META[p.planTier]?.label ?? p.planTier}`
                      : ""}
                    {p.seats ? ` · ${p.seats} seats` : ""}
                  </div>
                  <div className="truncate text-xs text-[var(--gy-text-subtle)]">
                    {formatDate(p.paidAt ?? p.createdAt)} ·{" "}
                    {titleCase(p.provider)}
                    {p.method ? ` · ${p.method}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-medium text-[var(--gy-text)]">
                    {formatMoney(p.amount, p.currency, 2)}
                  </span>
                  <Chip
                    size="sm"
                    variant={PAYMENT_VARIANT[p.status] ?? "neutral"}
                  >
                    {titleCase(p.status)}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MembersSection key={org.id} orgId={org.id} memberCount={org.memberCount} />

      <div>
        <SubHeading icon={<Receipt />} count={org.invoiceCount}>
          Invoices
        </SubHeading>
        {org.recentInvoices.length === 0 ? (
          <Empty>No invoices issued.</Empty>
        ) : (
          <div className="space-y-1">
            {org.recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className={`${GLASS_ROW} flex items-center justify-between gap-3 px-3 py-1.5 text-sm`}
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

export const OrganizationDetailModal = () => {
  const {
    state,
    canManage,
    canHardDelete,
    closeDetail,
    openDetail,
    openEdit,
    openSubscription,
    openStatusDialog,
    openDelete,
  } = useOrganizationsContext();
  const detail = state.detail;
  const org = detail?.data ?? null;
  const statusAction = !org
    ? null
    : CAN_SUSPEND.includes(org.status)
      ? ("SUSPENDED" as const)
      : CAN_ACTIVATE.includes(org.status)
        ? ("ACTIVE" as const)
        : null;

  return (
    <Modal
      isOpen={detail !== null}
      onClose={closeDetail}
      size="lg"
      title={org?.name ?? "Organization"}
      subtitle={org?.slug}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 w-full">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
            {canManage && org && (
              <>
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  leftIcon={<Pencil className="size-3.5" />}
                  onClick={() => void openEdit(org.id)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  leftIcon={<CreditCard className="size-3.5" />}
                  onClick={() => openSubscription(org)}
                >
                  Assign subscription
                </Button>
                {statusAction && (
                  <Button
                    variant={
                      statusAction === "SUSPENDED" ? "danger-soft" : "success"
                    }
                    size="sm"
                    className="w-full sm:w-auto"
                    leftIcon={
                      statusAction === "SUSPENDED" ? (
                        <Ban className="size-3.5" />
                      ) : (
                        <PlayCircle className="size-3.5" />
                      )
                    }
                    onClick={() => openStatusDialog(org, statusAction)}
                  >
                    {statusAction === "SUSPENDED"
                      ? "Suspend"
                      : org.status === "DELETED"
                        ? "Restore"
                        : "Activate"}
                  </Button>
                )}
                {(org.status !== "DELETED" || canHardDelete) && (
                  <Button
                    variant="danger-soft"
                    size="sm"
                    className="w-full sm:w-auto"
                    leftIcon={<Trash2 className="size-3.5" />}
                    onClick={() => openDelete(org)}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
          <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={closeDetail}>
            Close
          </Button>
        </div>
      }
    >
      {detail?.loading && !org ? (
        <div className="space-y-3">
          <Skeleton height="24px" width="50%" />
          <Skeleton height="96px" />
          <Skeleton height="120px" />
        </div>
      ) : detail?.error && !org ? (
        <div
          className={`${GLASS_ROW} flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-[var(--gy-text-secondary)]`}
        >
          <span>{detail.error}</span>
          <Button size="xs" onClick={() => openDetail(detail.orgId)}>
            Try again
          </Button>
        </div>
      ) : org ? (
        <DetailBody org={org} />
      ) : null}
    </Modal>
  );
}
