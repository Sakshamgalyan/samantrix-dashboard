export interface AnalyticsOverview {
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  /** Pending, unexpired invitations. */
  pendingInvitations: number;
  /** Seat limit of the organization. */
  maxMembers: number;
  seatUtilizationPercent: number;
  featuresEnabledCount: number;
  totalEntitledFeatures: number;
  storageUsedMb: number;
}

export type OrgAnalyticsOverview = AnalyticsOverview;

export type { ShortcutItem } from "@/features/analytics/common/constants";
