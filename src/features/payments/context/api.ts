import type React from "react";
import { api, ApiError } from "@/lib/api";
import type { BillingOverview, PaymentsAction } from "../types";
import { loadFailure, loadSuccess } from "./action";

/** Loads the platform billing overview (revenue, subscriptions, invoices) into context. */
export async function loadBillingOverviewApi(
  dispatch: React.Dispatch<PaymentsAction>,
): Promise<void> {
  try {
    dispatch(
      loadSuccess(await api.get<BillingOverview>("/finance/platform/overview")),
    );
  } catch (err) {
    dispatch(
      loadFailure(
        err instanceof ApiError
          ? err.message
          : "Couldn't load billing and revenue data.",
      ),
    );
  }
}
