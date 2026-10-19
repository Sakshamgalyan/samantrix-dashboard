export type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface DepartmentMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: OrgRole;
  jobTitle?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  joinedAt: string;
}

export interface DepartmentLead {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  jobTitle?: string | null;
  avatarUrl?: string | null;
}

export interface OrgDepartmentItem {
  name: string;
  memberCount: number;
  activeCount: number;
  lead?: DepartmentLead | null;
  members: DepartmentMember[];
}

export interface UpdateMemberDepartmentPayload {
  department?: string | null;
  jobTitle?: string | null;
}
