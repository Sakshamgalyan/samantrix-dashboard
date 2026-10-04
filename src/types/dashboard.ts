export type OrgRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export type OrgStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'TRIAL'
  | 'TRIALING'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'DELETED';

export type OrgPlanTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface Organization {
  id: string;
  name: string;
  legalName?: string;
  slug: string;
  domain?: string;
  orgType?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  state?: string;
  city?: string;
  website?: string;
  businessEmail?: string;
  businessPhone?: string;
  address?: string;
  logoUrl?: string;
  status: OrgStatus;
  planTier: OrgPlanTier;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'ANNUAL';
  maxWorkspaces?: number;
  maxMembers?: number;
  termsAcceptedAt?: string;
  termsVersion?: string;
  privacyAcceptedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  role: OrgRole;
  department?: string;
  jobTitle?: string;
  status: UserStatus | string;
  joinedAt?: string;
  createdAt?: string;
  user?: {
    id: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    twoFactorEnabled?: boolean;
    status?: string;
  };
}
export type OrgMember = OrganizationMember;

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: OrgRole;
  department?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  token?: string;
  inviteUrl?: string;
  inviter?: {
    id: string;
    fullName?: string;
    email?: string;
  };
  createdAt: string;
}
export type OrgInvitation = OrganizationInvitation;

export interface OrganizationSettings {
  id?: string;
  organizationId?: string;
  timezone: string;
  locale: string;
  dateFormat?: string;
  defaultRole?: string;
  allowMemberInvites?: boolean;
  retentionDays?: number;
  accentColor?: string;
  allowGuestAccess?: boolean;
  notifyOnNewMember?: boolean;
}
export type OrgSettings = OrganizationSettings;

export interface OrganizationSecurity {
  id?: string;
  organizationId?: string;
  requireTwoFactor?: boolean;
  enforce2FA?: boolean;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordExpiresDays?: number;
  requireSpecialChar?: boolean;
  allowedEmailDomains?: string[];
  allowedDomains?: string[];
}
export type OrgSecuritySettings = OrganizationSecurity;

export interface OrganizationFeature {
  id?: string;
  key?: string;
  featureKey?: string;
  name?: string;
  description?: string;
  category?: string;
  isEntitled?: boolean;
  isAllowed?: boolean;
  isEnabled: boolean;
  limitValue?: number | null;
}
export type OrgFeature = OrganizationFeature;

export interface Subscription {
  id?: string;
  planTier: OrgPlanTier;
  status: string;
  amount?: number;
  currency?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  maxSeats?: number;
  maxStorageMb?: number;
}
export type OrgSubscription = Subscription;

export interface Invoice {
  id: string;
  number?: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'VOID' | string;
  date?: string;
  createdAt: string;
  paymentMethod?: string;
  paidAt?: string;
  dueDate?: string;
  pdfUrl?: string;
  invoicePdfUrl?: string;
}
export type OrgInvoice = Invoice;

export interface OrganizationApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  maskedKey?: string;
  permissions?: string[];
  scopes?: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}
export type OrgApiKey = OrganizationApiKey;

export interface AuditLogEntry {
  id: string;
  organizationId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  category?: string;
  target?: string;
  resource?: string;
  ipAddress?: string;
  createdAt: string;
  details?: Record<string, unknown>;
}
export type OrgAuditLog = AuditLogEntry;
