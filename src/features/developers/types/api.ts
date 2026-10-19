/** Account status as stored by the backend (`UserStatus`). */
export type DeveloperStatus =
  "PENDING_VERIFICATION" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

/** One row of GET /auth/developers (paginated) */
export interface DeveloperAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  platformRole: string;
  status: DeveloperStatus;
  createdAt: string;
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
  /** Developers with a live session right now */
  online: number;
}

/** GET /auth/developers/summary */
export interface DevelopersSummary {
  counts: DeveloperCounts;
}

/** PATCH /auth/developers/:id body (send only what changed) */
export interface UpdateDeveloperRequest {
  fullName?: string;
  phone?: string;
  platformRole?: string;
  status?: "ACTIVE" | "SUSPENDED";
}
