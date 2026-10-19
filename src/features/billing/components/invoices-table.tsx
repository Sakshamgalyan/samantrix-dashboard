"use client";

import { Chip, Table, Typography, type Column } from "@galyan/ui";
import { Download, FileText } from "lucide-react";
import { formatDate } from "@/utils/format";
import { METHOD_LABELS, money } from "@/features/payments/common/constants";
import { tablePagination, type PaginationMeta } from "@/features/common/pagination";
import { INVOICE_CHIP } from "@/features/billing/common/constants";
import type { InvoiceRow } from "@/features/billing/types";

export interface InvoicesTableProps {
  invoices: InvoiceRow[];
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}

const invoiceColumns: Column<InvoiceRow>[] = [
  {
    key: "number",
    header: "Invoice",
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <FileText className="size-4 shrink-0 text-[var(--gy-text-secondary)]" />
        <Typography variant="span" weight="medium" textColor="var(--gy-text)" className="font-mono text-xs sm:text-sm">
          {row.invoiceNumber}
        </Typography>
      </div>
    ),
  },
  {
    key: "date",
    header: "Date",
    width: "140px",
    accessor: (row) => (
      <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-xs font-mono">
        {formatDate(row.paidAt ?? row.createdAt)}
      </Typography>
    ),
  },
  {
    key: "method",
    header: "Paid with",
    width: "150px",
    accessor: (row) => (
      <Typography variant="span" textColor="var(--gy-text-secondary)" className="text-xs">
        {row.paymentMethod ? (METHOD_LABELS[row.paymentMethod.toLowerCase()] ?? (row.paymentMethod === "RAZORPAY" ? "Razorpay" : row.paymentMethod)) : "—"}
      </Typography>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "100px",
    accessor: (row) => (
      <Chip variant={INVOICE_CHIP[row.status.toUpperCase()] ?? "neutral"} size="xs">
        {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
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
  {
    key: "pdf",
    header: "",
    width: "60px",
    align: "right",
    accessor: (row) =>
      row.invoicePdfUrl ? (
        <a
          href={row.invoicePdfUrl}
          target="_blank"
          rel="noreferrer"
          className="p-1 rounded text-[var(--gy-primary)] hover:bg-[var(--gy-surface-hover)] inline-flex transition-colors"
          aria-label="Download PDF"
        >
          <Download className="size-4" />
        </a>
      ) : null,
  },
];

export const InvoicesTable = ({ invoices, meta, onPageChange }: InvoicesTableProps) => {
  if (invoices.length === 0) {
    return (
      <div className="py-8 text-center">
        <Typography variant="p" textColor="var(--gy-text-subtle)" className="text-xs sm:text-sm">
          No invoices yet. Invoices appear here once a paid plan is active.
        </Typography>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
      <Table<InvoiceRow>
        columns={invoiceColumns}
        data={invoices}
        rowKey={(row: InvoiceRow) => row.id}
        hoverable
        size="sm"
        pagination={tablePagination(meta)}
        onPageChange={onPageChange}
      />
    </div>
  );
};
