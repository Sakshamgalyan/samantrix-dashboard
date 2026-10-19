"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Chip, Dropdown, Input, Table, type Column } from "@galyan/ui";
import { Receipt, RotateCcw, Search } from "lucide-react";
import { GlassSection } from "@/components/layout/common/glass-section";
import { SectionEmpty } from "@/components/layout/common/states";
import { tablePagination } from "@/features/common/pagination";
import { formatDateTime } from "@/utils/format";
import {
  METHOD_LABELS,
  money,
  PAYMENT_STATUS,
  PLAN_LABELS,
  PURPOSE_LABELS,
} from "@/features/payments/common/constants";
import { usePaymentsContext } from "@/features/payments/context";
import type { PaymentProvider, PaymentRow, PaymentStatus } from "@/features/payments/types";

const RefundModal = dynamic(
  () => import("@/features/payments/components/refund-modal").then((m) => m.RefundModal),
  { ssr: false },
);

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  ...(Object.keys(PAYMENT_STATUS) as PaymentStatus[]).map((s) => ({
    value: s,
    label: PAYMENT_STATUS[s].label,
  })),
];

const PROVIDER_OPTIONS = [
  { value: "ALL", label: "All sources" },
  { value: "RAZORPAY", label: "Razorpay" },
  { value: "MANUAL", label: "Manual" },
];

/** Every payment attempt (online and manual), filterable and paged on the server. */
export const PaymentsTable = ({ canRefund }: { canRefund: boolean }) => {
  const { state, setFilters } = usePaymentsContext();
  const [search, setSearch] = useState(state.filters.search);
  const [refunding, setRefunding] = useState<PaymentRow | null>(null);

  // Debounce the search box into the server filter
  useEffect(() => {
    if (search === state.filters.search) return;
    const t = setTimeout(() => setFilters({ search }), 350);
    return () => clearTimeout(t);
  }, [search, state.filters.search, setFilters]);

  const columns = useMemo<Column<PaymentRow>[]>(() => {
    const cols: Column<PaymentRow>[] = [
      {
        key: "organization",
        header: "Organization",
        width: "240px",
        accessor: (row) => (
          <div className="flex min-w-0 max-w-full flex-col overflow-hidden">
            <span
              className="truncate text-sm font-medium text-[var(--gy-text)]"
              title={row.organization.name}
            >
              {row.organization.name}
            </span>
            <span
              className="truncate text-xs text-[var(--gy-text-subtle)]"
              title={[
                PURPOSE_LABELS[row.purpose],
                row.planTier ? PLAN_LABELS[row.planTier] : null,
                row.seats ? `${row.seats} seat${row.seats === 1 ? "" : "s"}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            >
              {PURPOSE_LABELS[row.purpose]}
              {row.planTier ? ` · ${PLAN_LABELS[row.planTier]}` : ""}
              {row.seats ? ` · ${row.seats} seat${row.seats === 1 ? "" : "s"}` : ""}
            </span>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        width: "140px",
        align: "right",
        accessor: (row) => (
          <div className="flex flex-col items-end whitespace-nowrap">
            <span className="text-sm font-semibold text-[var(--gy-text)]">
              {money(row.amount, row.currency, 2)}
            </span>
            {row.refundedAmount > 0 && (
              <span className="text-xs text-[var(--gy-warning)]">
                −{money(row.refundedAmount, row.currency, 2)} refunded
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "130px",
        accessor: (row) => (
          <div className="flex flex-col items-start gap-0.5">
            <Chip variant={PAYMENT_STATUS[row.status].chip} size="xs" className="shrink-0">
              {PAYMENT_STATUS[row.status].label}
            </Chip>
            {row.failureReason && row.status === "FAILED" && (
              <span
                className="max-w-[120px] truncate text-xs text-[var(--gy-text-subtle)]"
                title={row.failureReason}
              >
                {row.failureReason}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "source",
        header: "Method",
        width: "150px",
        accessor: (row) => (
          <div className="flex min-w-0 max-w-full flex-col overflow-hidden">
            <span className="truncate text-sm text-[var(--gy-text)]">
              {row.provider === "MANUAL" ? "Manual" : "Razorpay"}
            </span>
            <span
              className="truncate text-xs text-[var(--gy-text-subtle)]"
              title={row.providerPaymentId ?? row.reference ?? undefined}
            >
              {[
                row.method ? (METHOD_LABELS[row.method] ?? row.method) : null,
                row.reference ?? row.providerPaymentId,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "invoice",
        header: "Invoice",
        width: "130px",
        accessor: (row) => (
          <span className="font-mono text-xs text-[var(--gy-text-secondary)] whitespace-nowrap">
            {row.invoice?.invoiceNumber ?? "—"}
          </span>
        ),
      },
      {
        key: "date",
        header: "Date",
        width: "160px",
        accessor: (row) => (
          <span className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]">
            {formatDateTime(row.paidAt ?? row.createdAt)}
          </span>
        ),
      },
    ];

    if (canRefund) {
      cols.push({
        key: "actions",
        header: "",
        width: "90px",
        align: "right",
        accessor: (row) =>
          row.status === "PAID" ? (
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<RotateCcw className="size-3" />}
              onClick={() => setRefunding(row)}
            >
              Refund
            </Button>
          ) : null,
      });
    }

    return cols;
  }, [canRefund]);

  const data = state.payments;
  if (!data) return null;
  const { meta } = data;

  return (
    <GlassSection
      title="Payment history"
      subtitle={`${meta.total} payment${meta.total === 1 ? "" : "s"}`}
      headerClassName="xl:flex-row xl:items-center"
      aside={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full xl:w-auto">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
            <div className="w-full sm:w-40">
              <Dropdown
                size="sm"
                options={STATUS_OPTIONS}
                value={state.filters.status}
                onChange={(v) => setFilters({ status: v as PaymentStatus | "ALL" })}
                aria-label="Filter by status"
              />
            </div>
            <div className="w-full sm:w-36">
              <Dropdown
                size="sm"
                options={PROVIDER_OPTIONS}
                value={state.filters.provider}
                onChange={(v) => setFilters({ provider: v as PaymentProvider | "ALL" })}
                aria-label="Filter by source"
              />
            </div>
          </div>
          <div className="w-full sm:w-56">
            <Input
              size="sm"
              placeholder="Organization or payment id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="size-3.5" />}
              className="w-full"
            />
          </div>
        </div>
      }
    >
      {data.data.length === 0 ? (
        <SectionEmpty
          icon={<Receipt className="size-5" />}
          title="No payments found"
          description="Online checkouts and recorded payments appear here."
        />
      ) : (
        <div className="w-full overflow-x-auto">
          <Table<PaymentRow>
            columns={columns}
            data={data.data}
            rowKey={(row) => row.id}
            size="sm"
            hoverable
            responsive="scroll"
            pagination={tablePagination(meta)}
            onPageChange={(page) => setFilters({ page })}
          />
        </div>
      )}
      {canRefund && (
        <RefundModal
          key={refunding?.id ?? "closed"}
          payment={refunding}
          onClose={() => setRefunding(null)}
        />
      )}
    </GlassSection>
  );
};
