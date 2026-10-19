import type { DropdownOption } from "@galyan/ui";
import type { OrgRole } from "@/types/dashboard";

/** One row of `GET /organizations/current/members` (only the fields the console shows). */
export interface TeamMemberRecord {
  /** Membership id (used by the role / status / remove actions). */
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: OrgRole;
  department: string | null;
  status: string;
  joinedAt: string;
}

export interface InviteMemberRequest {
  email: string;
  role: OrgRole;
  department: string;
}

export interface InviteMemberResponse {
  inviteUrl?: string;
}

export interface AddMemberRequest {
  email: string;
  fullName: string;
  password?: string;
  role: OrgRole;
  department: string;
}

export interface AddMemberResponse {
  member: TeamMemberRecord;
  temporaryPassword?: string;
}

export const ROLE_OPTIONS: DropdownOption[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

export const ROLE_FILTER_OPTIONS: DropdownOption[] = [
  { value: "ALL", label: "All roles" },
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

export const STATUS_FILTER_OPTIONS: DropdownOption[] = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active only" },
  { value: "SUSPENDED", label: "Suspended only" },
];

export const INVITE_ROLE_OPTIONS: DropdownOption[] = [
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
];

export const DEPARTMENT_OPTIONS: DropdownOption[] = [
  { value: "Engineering", label: "Engineering" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Sales", label: "Sales" },
  { value: "Operations", label: "Operations" },
];
