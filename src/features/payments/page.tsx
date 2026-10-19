"use client";

import { PaymentsProvider } from "@/features/payments/context";
import { PaymentsContent } from "@/features/payments/components/payments-content";

/** /admin/payments: platform revenue, subscriptions and invoices across organizations. */
export const AdminPaymentsPage = () => {
  return (
    <PaymentsProvider>
      <PaymentsContent />
    </PaymentsProvider>
  );
};

export default AdminPaymentsPage;
