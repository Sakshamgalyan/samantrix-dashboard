"use client";

import { useMemo } from "react";
import { Chip, Input, Table, Tabs, type Column } from "@galyan/ui";
import { Receipt, Search } from "lucide-react";
import { GlassSection, SectionEmpty } from "@/components/admin";
import { formatDate, formatNumber, titleCase } from "@/lib/format";
import {
  INVOICE_STATUS_ORDER,
  invoiceChip,
  money,
  orderStatuses,
  statusLabel,
} from "../common/constants";
import { usePaymentsContext } from "../context";
import type { InvoiceRow } from "../types";

const columns: Column<InvoiceRow>[] = [
  {
    key: "invoice",
    header: "Invoice",
    accessor: (row) => (
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-mono text-sm text-[var(--gy-text)]">
          {row.invoiceNumber}
        </span>
        <span className="truncate text-xs text-[var(--gy-text-secondary)]">
          {row.paymentMethod
            ? titleCase(row.paymentMethod)
            : "No payment method"}
        </span>
      </div>
    ),
  },
  {
    key: "organization",
    header: "Organization",
    width: "220px",
    accessor: (row) => (
      <span className="block truncate text-sm text-[var(--gy-text)]">
        {row.organization.name}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    width: "130px",
    align: "right",
    accessor: (row) => (
      <span className="whitespace-nowrap text-sm font-medium text-[var(--gy-text)]">
        {money(row.amount, row.currency)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "120px",
    accessor: (row) => (
      <span className="whitespace-nowrap">
        <Chip size="sm" variant={invoiceChip(row.status)}>
          {statusLabel(row.status)}
        </Chip>
      </span>
    ),
  },
  {
    key: "issuedAt",
    header: "Issued",
    width: "130px",
    accessor: (row) => (
      <span className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]">
        {formatDate(row.issuedAt)}
      </span>
    ),
  },
  {
    key: "paidAt",
    header: "Paid / due",
    width: "140px",
    accessor: (row) => (
      <span className="whitespace-nowrap text-xs text-[var(--gy-text-secondary)]">
        {row.paidAt
          ? `Paid ${formatDate(row.paidAt)}`
          : row.dueDate
            ? `Due ${formatDate(row.dueDate)}`
            : "Not paid"}
      </span>
    ),
  },
];

/** Most recent invoices across organizations, filterable by status and searchable. */
export function InvoicesSection() {
  const { state, visibleInvoices, setInvoiceTab, setInvoiceSearch } =
    usePaymentsContext();
  const data = state.data;

  // Tab counts describe the rows loaded here (the latest invoices), so they match the table
  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of data?.invoices.recent ?? [])
      counts.set(i.status, (counts.get(i.status) ?? 0) + 1);
    return [...counts].map(([status, count]) => ({ status, count }));
  }, [data]);

  if (!data) return null;
  const { recent, byStatus } = data.invoices;
  const totalInvoices = byStatus.reduce((sum, s) => sum + s.count, 0);

  const tabs = [
    { id: "ALL", label: `All · ${recent.length}` },
    ...orderStatuses(statusCounts, INVOICE_STATUS_ORDER).map((s) => ({
      id: s.status,
      label: `${statusLabel(s.status)} · ${s.count}`,
    })),
  ];

  return (
    <GlassSection
      title="Recent invoices"
      subtitle={
        totalInvoices > recent.length
          ? `Latest ${formatNumber(recent.length)} of ${formatNumber(totalInvoices)} invoices across organizations`
          : "Invoices issued to organizations, newest first"
      }
    >
      {recent.length === 0 ? (
        <SectionEmpty
          icon={<Receipt className="size-5" />}
          title="No invoices issued yet"
          description="Invoices appear here once an organization is billed for a paid plan."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <Tabs
              items={tabs}
              activeTab={state.invoiceTab}
              onTabChange={setInvoiceTab}
              variant="button"
              size="sm"
            />
            <div className="w-full lg:w-72">
              <Input
                size="sm"
                placeholder="Search invoice or organization…"
                value={state.invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                leftIcon={<Search className="size-3.5" />}
                clearable
                onClear={() => setInvoiceSearch("")}
                fullWidth
                aria-label="Search invoices"
              />
            </div>
          </div>
          <Table<InvoiceRow>
            columns={columns}
            data={visibleInvoices}
            rowKey={(row) => row.id}
            hoverable
            size="md"
            emptyStateLabel="No invoices match your filters"
          />
        </div>
      )}
    </GlassSection>
  );
}
