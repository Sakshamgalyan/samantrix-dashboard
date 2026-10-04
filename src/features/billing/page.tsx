"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Banner, Button, Card, Chip, EmptyState, Table, useToast, type Column } from "@galyan/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { OrgInvoice } from "@/types/dashboard";
import { Receipt, CreditCard, Building, Download, Plus, RefreshCw } from "lucide-react";

export default function BillingPage() {
  const { organization, isOwner } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<OrgInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get<OrgInvoice[]>("/organizations/me/invoices")
      .then((data) => {
        if (!active) return;
        setInvoices(data || []);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Failed to load invoices.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const fetchInvoices = useCallback(() => {
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const billingContactEmail = organization?.businessEmail || "billing@organization.com";

  const columns = useMemo<Column<OrgInvoice>[]>(
    () => [
      {
        key: "number",
        header: "Invoice #",
        accessor: (inv) => <span className="font-semibold text-[var(--gy-text)]">{inv.number}</span>,
      },
      {
        key: "date",
        header: "Billing date",
        accessor: (inv) => (
          <span className="text-[var(--gy-text-secondary)]">
            {new Date(inv.date || inv.createdAt || Date.now()).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        accessor: (inv) => (
          <span className="font-semibold text-[var(--gy-text)]">
            ${inv.amount.toFixed(2)} {inv.currency}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        accessor: (inv) => (
          <Chip variant={inv.status === "PAID" ? "success" : "warning"} size="sm">
            {inv.status}
          </Chip>
        ),
      },
      {
        key: "receipt",
        header: "Receipt",
        align: "right",
        headerAlign: "right",
        accessor: (inv) =>
          inv.pdfUrl ? (
            <Button
              variant="link"
              size="sm"
              href={inv.pdfUrl}
              external
              leftIcon={<Download className="size-4" />}
            >
              PDF
            </Button>
          ) : (
            <span className="text-xs text-[var(--gy-text-subtle)]">Not generated</span>
          ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--gy-text)]">Billing &amp; invoices</h2>
          <p className="mt-1 text-sm text-[var(--gy-text-secondary)]">
            Manage your organization payment methods, billing receipts, and fiscal tax contacts.
          </p>
        </div>

        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="size-4" />} onClick={fetchInvoices}>
          Refresh invoices
        </Button>
      </div>

      {error && (
        <Banner
          variant="danger"
          title="Could not load invoices"
          description={error}
          button={
            <Button variant="danger-soft" size="sm" onClick={fetchInvoices}>
              Retry
            </Button>
          }
        />
      )}

      {/* Payment method & billing contact */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card padding="lg" radius="xl" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)]/10 text-[var(--gy-primary)]">
                <CreditCard className="size-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--gy-text)]">Payment method</h3>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => toast.info("Payment gateway checkout integration in progress.")}
              >
                Add card
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-4">
            <div className="flex items-center gap-3">
              <Chip variant="neutral" size="sm" radius="md">
                Trial
              </Chip>
              <div>
                <p className="text-sm font-semibold text-[var(--gy-text)]">Complimentary SaaS trial</p>
                <p className="text-xs text-[var(--gy-text-subtle)]">No payment method required during trial</p>
              </div>
            </div>
            <Chip variant="success" size="sm">
              Active
            </Chip>
          </div>
        </Card>

        <Card padding="lg" radius="xl" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-info)]/10 text-[var(--gy-info)]">
              <Building className="size-4" />
            </div>
            <h3 className="text-base font-bold text-[var(--gy-text)]">Billing information</h3>
          </div>

          <div className="divide-y divide-[var(--gy-divider)] text-sm">
            <div className="flex justify-between gap-4 py-2">
              <span className="text-[var(--gy-text-secondary)]">Legal company</span>
              <span className="font-semibold text-[var(--gy-text)]">
                {organization?.legalName || organization?.name || "Acme Corporation"}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <span className="text-[var(--gy-text-secondary)]">Billing email</span>
              <span className="font-semibold text-[var(--gy-primary)]">{billingContactEmail}</span>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <span className="text-[var(--gy-text-secondary)]">Tax jurisdiction</span>
              <span className="font-semibold text-[var(--gy-text)]">{organization?.country || "United States"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Invoice history */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-[var(--gy-primary)]" />
          <h3 className="text-base font-bold tracking-tight text-[var(--gy-text)]">Invoice history</h3>
        </div>

        <Card padding="none" radius="xl" className="overflow-hidden">
          <Table<OrgInvoice>
            columns={columns}
            data={invoices}
            rowKey={(inv) => inv.id}
            hoverable
            noBorder
            isLoading={loading}
            skeletonRows={4}
            emptyState={
              <EmptyState
                size="sm"
                icon={<Receipt className="size-8" />}
                title="No invoices generated yet"
                description="Your organization is in active free trial status. Invoices and receipts will populate here automatically upon paid plan renewal."
              />
            }
          />
        </Card>
      </div>
    </div>
  );
}
