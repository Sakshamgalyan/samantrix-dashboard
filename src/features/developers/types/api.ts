/** Account status as stored by the backend (`UserStatus`). */
export type DeveloperStatus =
  "PENDING_VERIFICATION" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

/** One row of GET /auth/developers */
export interface DeveloperAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  platformRole: string;
  status: DeveloperStatus;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string | null;
  lastDevice: string | null;
  online: boolean;
}

export interface DeveloperCounts {
  total: number;
  pending: number;
  active: number;
  rejected: number;
  suspended: number;
}

/** GET /auth/developers */
export interface DevelopersResponse {
  counts: DeveloperCounts;
  developers: DeveloperAccount[];
}

/** PATCH /auth/developers/:id/approve body */
export interface ApproveDeveloperRequest {
  platformRole: string;
}
