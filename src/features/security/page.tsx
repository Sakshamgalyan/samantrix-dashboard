"use client";

import { SecurityProvider } from "@/features/security/context";
import { SecurityContent } from "@/features/security/components/security-content";

export default function SecurityPage() {
  return (
    <SecurityProvider>
      <SecurityContent />
    </SecurityProvider>
  );
}
