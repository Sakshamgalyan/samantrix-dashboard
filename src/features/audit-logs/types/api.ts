/** One row of the organization's audit trail (only what the console shows). */
export interface OrgAuditLogRow {
  id: string;
  action: string;
  actorEmail?: string;
  /** Target resource of the action. */
  target?: string;
  createdAt: string;
}

export type AuditLogItem = OrgAuditLogRow;
