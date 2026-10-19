"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button, Chip } from "@galyan/ui";
import { Plus } from "lucide-react";
import { AdminLoadError, AdminPageSkeleton } from "@/components/layout/common/states";
import { useAuth } from "@/features/auth";
import { hasPermission, isSuperadmin } from "@/utils/roles";
import { usePaymentsContext } from "@/features/payments/context";
import { PaymentsKpis } from "@/features/payments/components/payments-kpis";
import { SeatsSection } from "@/features/payments/components/seats-section";
import { PlanPricesSection } from "@/features/payments/components/plan-prices-section";
import { PaymentsTable } from "@/features/payments/components/payments-table";

const ManualPaymentModal = dynamic(
  () =>
    import("@/features/payments/components/manual-payment-modal").then(
      (m) => m.ManualPaymentModal,
    ),
  { ssr: false },
);

/** /admin/payments: seats sold vs used, payment history, manual payments and the price list. */
export const PaymentsContent = () => {
  const { user } = useAuth();
  const { state, reload } = usePaymentsContext();
  const [manualOpen, setManualOpen] = useState(false);
  const [manualKey, setManualKey] = useState(0);

  const canManage = hasPermission(user, "payments:manage");
  const superadmin = isSuperadmin(user);

  if (state.loading && !state.payments) return <AdminPageSkeleton />;
  if (state.error && !state.payments) {
    return (
      <AdminLoadError
        title="Couldn't load payments"
        message={state.error}
        onRetry={() => void reload()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {state.config && (
            <Chip variant={state.config.enabled ? "success" : "neutral"} size="sm">
              {state.config.enabled ? "Razorpay connected" : "Razorpay not configured"}
            </Chip>
          )}
          {state.config?.enabled && !state.config.webhookConfigured && (
            <Chip variant="warning" size="sm">
              Webhook secret missing
            </Chip>
          )}
          <span className="text-xs text-[var(--gy-text-subtle)]">
            Prices in INR per seat · {state.config?.taxPercent ?? 18}% GST added at checkout
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canManage && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="size-3.5" />}
              className="w-full sm:w-auto"
              onClick={() => {
                setManualKey((k) => k + 1);
                setManualOpen(true);
              }}
            >
              Record payment
            </Button>
          )}
        </div>
      </div>

      <PaymentsKpis />

      <PlanPricesSection editable={superadmin} />

      <SeatsSection />

      <PaymentsTable canRefund={superadmin} />

      {canManage && (
        <ManualPaymentModal
          key={manualKey}
          isOpen={manualOpen}
          onClose={() => setManualOpen(false)}
        />
      )}
    </div>
  );
};
