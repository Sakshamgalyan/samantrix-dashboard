"use client";

import { PaymentsProvider } from "./context";
import { PaymentsContent } from "./components/payments-content";

/** /admin/payments: platform revenue, subscriptions and invoices across organizations. */
export function AdminPaymentsPage() {
  return (
    <PaymentsProvider>
      <PaymentsContent />
    </PaymentsProvider>
  );
}

export default AdminPaymentsPage;
