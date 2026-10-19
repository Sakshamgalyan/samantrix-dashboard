import type { Dispatch } from "react";
import type { AuditLogsState } from "@/features/audit-logs/types/state";
import type { AuditLogsAction } from "@/features/audit-logs/types/actions";

export interface AuditLogsContextValue {
  state: AuditLogsState;
  dispatch: Dispatch<AuditLogsAction>;
}
