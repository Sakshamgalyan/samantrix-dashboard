"use client";

import React from "react";
import { SubscriptionProvider } from "@/features/subscription/context";
import { SubscriptionContent } from "@/features/subscription/components/subscription-content";

export default function SubscriptionPage() {
  return (
    <SubscriptionProvider>
      <SubscriptionContent />
    </SubscriptionProvider>
  );
}
