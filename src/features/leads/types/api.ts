export type LeadType = "CONTACT" | "WAITLIST" | "ENTERPRISE" | "DEMO";
export type LeadStatus = "PENDING" | "CONFIRMED" | "CONTACTED" | "ARCHIVED";

/** Row of `GET /leads`. Missing fields are null (the backend never invents values). */
export interface LeadListItem {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string | null;
  email: string;
  company: string | null;
  teamSize: string | null;
  interest: string | null;
  message: string | null;
  source: string | null;
  notesCount: number;
  invitedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

/** `GET /leads/:id` */
export interface LeadDetail extends LeadListItem {
  visitorId: string | null;
  notes: LeadNote[];
  metadata: Record<string, unknown>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LeadsPage {
  data: LeadListItem[];
  meta: PaginationMeta;
}

export interface LeadsListQuery {
  page: number;
  limit: number;
  type: LeadType | "ALL";
  status: LeadStatus | "ALL";
  search?: string;
}

/** `GET /leads/summary` */
export interface LeadsSummary {
  generatedAt: string;
  total: number;
  awaitingFollowUp: number;
  byType: Record<LeadType, number>;
  byStatus: Record<LeadStatus, number>;
  waitlist: { total: number; queued: number; invited: number; archived: number };
  newLast7d: number;
  newLast30d: number;
  newPrev30d: number;
  trend: Array<{ date: string; count: number }>;
}

/** `POST /leads/:id/notes` */
export interface AddNoteResponse {
  id: string;
  note: LeadNote;
  notes: LeadNote[];
}

/** `POST /leads/waitlist/batch-invite` */
export interface BatchInviteResponse {
  invitedCount: number;
  skippedCount: number;
  invitedIds: string[];
}
