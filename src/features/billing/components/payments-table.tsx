"use client";

import { Chip, Table, Typography, type Column } from "@galyan/ui";
import { formatDateTime } from "@/utils/format";
import { money, PAYMENT_STATUS, PLAN_LABELS, PURPOSE_LABELS } from "@/features/payments/common/constants";
import { tablePagination, type PaginationMeta } from "@/features/common/pagination";
import type { MyPaymentRow } from "@/features/billing/types";

export interface PaymentsTableProps {
  payments: MyPaymentRow[];
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}

const paymentColumns: Column<MyPaymentRow>[] = [
  {
    key: "what",
    header: "Purchase",
    accessor: (row) => (
      <div className="flex flex-col">
        <Typography variant="span" weight="medium" textColor="var(--gy-text)" className="text-xs sm:text-sm">
          {PURPOSE_LABELS[row.purpose]}
          {row.planTier ? ` · ${PLAN_LABELS[row.planTier]}` : ""}
        </Typography>
        <Typography variant="span" textColor="var(--gy-text-subtle)" className="text-xs">
          {row.seats ? `${row.seats} seat${row.seats === 1 ? "" : "s"}` : ""}
          {row.billingCycle ? ` · ${row.billingCycle === "YEARLY" ? "yearly" : "monthly"}` : ""}
        </Typography>
      </div>
    ),
  },
  {
    key: "date",
    header: "Date",
    width: "170px",
    accessor: (row) => (
      <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-xs font-mono">
        {formatDateTime(row.paidAt ?? row.createdAt)}
      </Typography>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "110px",
    accessor: (row) => (
      <Chip variant={PAYMENT_STATUS[row.status].chip} size="xs">
        {PAYMENT_STATUS[row.status].label}
      </Chip>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    width: "130px",
    align: "right",
    accessor: (row) => (
      <Typography variant="span" weight="bold" textColor="var(--gy-text)" className="text-xs sm:text-sm">
        {money(row.amount, row.currency, 2)}
      </Typography>
    ),
  },
];

export const PaymentsTable = ({ payments, meta, onPageChange }: PaymentsTableProps) => {
  if (payments.length === 0) {
    return (
      <div className="py-8 text-center">
        <Typography variant="p" textColor="var(--gy-text-subtle)" className="text-xs sm:text-sm">
          No payment transactions found.
        </Typography>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
      <Table<MyPaymentRow>
        columns={paymentColumns}
        data={payments}
        rowKey={(row: MyPaymentRow) => row.id}
        hoverable
        size="sm"
        pagination={tablePagination(meta)}
        onPageChange={onPageChange}
      />
    </div>
  );
};
