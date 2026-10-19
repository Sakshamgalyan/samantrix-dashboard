"use client";

import React from "react";
import { AuditLogsProvider } from "@/features/audit-logs/context";
import { AuditLogsContent } from "@/features/audit-logs/components/audit-logs-content";

const AuditLogsPage = () => {
  return (
    <AuditLogsProvider>
      <AuditLogsContent />
    </AuditLogsProvider>
  );
};

export default AuditLogsPage;

