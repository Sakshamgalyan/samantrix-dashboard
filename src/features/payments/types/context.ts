import type React from "react";
import type { InvoiceRow, SubscriptionRow } from "./api";
import type { PaymentsAction } from "./actions";
import type { InvoiceTab, PaymentsPageState, SubscriptionTab } from "./state";

export interface PaymentsContextType {
  state: PaymentsPageState;
  dispatch: React.Dispatch<PaymentsAction>;

  // Derived (filtered by the active tab + search)
  visibleSubscriptions: SubscriptionRow[];
  visibleInvoices: InvoiceRow[];

  // Actions
  setSubscriptionTab: (tab: SubscriptionTab) => void;
  setSubscriptionSearch: (search: string) => void;
  setInvoiceTab: (tab: InvoiceTab) => void;
  setInvoiceSearch: (search: string) => void;

  // API handlers
  refresh: () => Promise<void>;
}
