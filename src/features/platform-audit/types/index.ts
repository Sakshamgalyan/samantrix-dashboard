export interface PlatformAuditLog {
  id: string;
  organizationId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  category: string;
  target: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  details?: Record<string, unknown>;
}

export interface PlatformAuditSummary {
  totalLogs: number;
  todayLogs: number;
  categoryDistribution?: Record<string, number>;
  topActions?: { action: string; count: number }[];
}

export interface PlatformAuditQuery {
  page?: number;
  limit?: number;
  category?: string;
  action?: string;
  actorEmail?: string;
  organizationId?: string;
}
