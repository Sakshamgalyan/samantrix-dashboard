"use client";

import { useState } from "react";
import { Banner, Button, Input, Modal, useToast } from "@galyan/ui";
import { RotateCcw } from "lucide-react";
import { money } from "@/features/payments/common/constants";
import { errorMessage, usePaymentsContext } from "@/features/payments/context";
import type { PaymentRow } from "@/features/payments/types";

/** Superadmin: refund all or part of a paid payment (Razorpay refunds go back to the payer). */
export const RefundModal = ({ payment, onClose }: { payment: PaymentRow | null; onClose: () => void }) => {
  const { refundPayment } = usePaymentsContext();
  const { toast } = useToast();
  const remaining = payment ? Math.round((payment.amount - payment.refundedAmount) * 100) / 100 : 0;
  // Mounted with key={payment id}: starts with the full remaining amount
  const [amount, setAmount] = useState(() => (payment ? String(remaining) : ""));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!payment) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > remaining) {
      return setError(`Enter an amount between ₹1 and ${money(remaining, payment.currency, 2)}.`);
    }
    if (!reason.trim()) return setError("Add a reason for the refund.");
    setBusy(true);
    setError(null);
    try {
      await refundPayment(payment.id, value === remaining ? undefined : value, reason.trim());
      toast.success(`Refunded ${money(value, payment.currency, 2)} to ${payment.organization.name}`);
      onClose();
    } catch (err) {
      setError(errorMessage(err, "The refund failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={payment !== null}
      onClose={busy ? undefined : onClose}
      size="sm"
      icon={<RotateCcw className="size-4" />}
      title="Refund payment"
      subtitle={
        payment
          ? `${payment.organization.name} · ${payment.provider === "RAZORPAY" ? "refunded to the original payment method via Razorpay" : "manual payment: record the refund you made offline"}`
          : undefined
      }
      preventBackdropClose={busy}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={() => void submit()} isLoading={busy}>
            Refund
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error && <Banner variant="danger" size="sm" bannerStyle="subtle" description={error} />}
        <Input
          label={`Amount (up to ${payment ? money(remaining, payment.currency, 2) : ""})`}
          size="sm"
          type="number"
          min={1}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input label="Reason" size="sm" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate payment" />
      </div>
    </Modal>
  );
}
