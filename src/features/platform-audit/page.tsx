"use client";

import React from "react";
import { PlatformAuditProvider } from "@/features/platform-audit/context";
import { PlatformAuditContent } from "@/features/platform-audit/components/platform-audit-content";

export const PlatformAuditPage = () => {
  return (
    <PlatformAuditProvider>
      <PlatformAuditContent />
    </PlatformAuditProvider>
  );
};

export default PlatformAuditPage;
