"use client";

import React from "react";
import { BillingProvider } from "@/features/billing/context";
import { BillingContent } from "@/features/billing/components/billing-content";

export default function BillingPage() {
  return (
    <BillingProvider>
      <BillingContent />
    </BillingProvider>
  );
}
