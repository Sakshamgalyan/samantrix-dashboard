import type { PaginationMeta } from "@/features/common/pagination";
import type { CurrentUserSession } from "@/features/auth";
import type { OrgRole } from "@/types/dashboard";
import type { TeamMemberRecord } from "@/features/users/types/api";

export interface InviteDialogState {
  isOpen: boolean;
  tab: "link" | "direct";
  email: string;
  fullName: string;
  password: string;
  showPassword?: boolean;
  role: OrgRole;
  department: string;
  isInviting: boolean;
  inviteResult: { inviteUrl: string } | null;
  directResult: { fullName: string; email: string } | null;
  copiedLink: boolean;
  error: string | null;
}

export interface MemberSettingsDialogState {
  member: TeamMemberRecord | null;
  role: OrgRole;
  status: string;
  isSaving: boolean;
  error: string | null;
}

export interface RemoveDialogState {
  id: string;
  name: string;
}

/** Local UI state handled by reducer. */
export interface UsersUiState {
  search: string;
  appliedSearch: string;
  roleFilter: string;
  statusFilter: string;
  page: number;
  refreshing: boolean;
  actionError: string | null;
  inviteDialog: InviteDialogState;
  settingsDialog: MemberSettingsDialogState;
  removeDialog: RemoveDialogState | null;
}

/** Composite state consumed by components. */
export interface UsersState extends UsersUiState {
  members: TeamMemberRecord[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  totalMembers: number;
  seatLimit: number;
  activeCount: number;
  suspendedCount: number;
  pendingInvites: number;
  seatUtilizationPercent: number;
  allowedEmailDomains: string[];
  presenceMap: Record<string, { status: string }>;
  onlineUserIds: string[];
  currentUser: CurrentUserSession | null;
  canManageTeam: boolean;
}
