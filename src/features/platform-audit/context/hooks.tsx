import { useContext } from "react";
import { PlatformAuditContext } from "@/features/platform-audit/context/index";
import type { PlatformAuditContextValue } from "@/features/platform-audit/context/types";

export const usePlatformAudit = (): PlatformAuditContextValue => {
  const context = useContext(PlatformAuditContext);
  if (!context) {
    throw new Error(
      "usePlatformAudit must be used within a PlatformAuditProvider",
    );
  }
  return context;
};
