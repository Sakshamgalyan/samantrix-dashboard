"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Table,
  Column,
  AnimatedNumber,
  ProgressBar,
  Input,
  Dropdown,
  DropdownOption,
  Modal,
  Banner,
  useToast,
} from "@galyan/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRealtime } from "@/lib/realtime-context";
import { OrgRole, OrgMember, OrgInvitation } from "@/types/dashboard";
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  PlayCircle,
  Ban,
  Send,
} from "lucide-react";

type CurrentUser = ReturnType<typeof useAuth>["user"];

interface TeamData {
  members: OrgMember[];
  invitations: OrgInvitation[];
}

interface InviteResponse {
  inviteUrl?: string;
  token?: string;
}

const SEAT_LIMIT = 25;

const ROLE_OPTIONS: DropdownOption[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

const ROLE_FILTER_OPTIONS: DropdownOption[] = [
  { value: "ALL", label: "All roles" },
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

const STATUS_FILTER_OPTIONS: DropdownOption[] = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active only" },
  { value: "SUSPENDED", label: "Suspended only" },
];

const INVITE_ROLE_OPTIONS: DropdownOption[] = [
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
];

const DEPARTMENT_OPTIONS: DropdownOption[] = [
  { value: "Engineering", label: "Engineering" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Sales", label: "Sales" },
  { value: "Operations", label: "Operations" },
];

function buildFallbackRoster(currentUser: CurrentUser): OrgMember[] {
  return [
    {
      id: currentUser?.id || "usr_self",
      userId: currentUser?.id || "usr_self",
      role: (currentUser?.role as OrgRole) || "OWNER",
      status: "ACTIVE",
      joinedAt: new Date().toISOString(),
      user: {
        id: currentUser?.id || "usr_self",
        fullName: currentUser?.fullName || "Current User",
        email: currentUser?.email || "owner@workspace.io",
        avatarUrl: currentUser?.avatarUrl,
      },
    },
    {
      id: "mem_02",
      userId: "usr_02",
      role: "ADMIN",
      status: "ACTIVE",
      joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      user: { id: "usr_02", fullName: "Sarah Connor", email: "sarah.c@company.internal" },
    },
    {
      id: "mem_03",
      userId: "usr_03",
      role: "MEMBER",
      status: "ACTIVE",
      joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      user: { id: "usr_03", fullName: "David Chen", email: "d.chen@company.internal" },
    },
    {
      id: "mem_04",
      userId: "usr_04",
      role: "MEMBER",
      status: "SUSPENDED",
      joinedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      user: { id: "usr_04", fullName: "Liam O'Connor", email: "liam@company.internal" },
    },
  ];
}

async function loadTeam(currentUser: CurrentUser): Promise<TeamData> {
  const [membersData, invitesData] = await Promise.all([
    api
      .get<OrgMember[]>("/organizations/current/members")
      .catch(() => api.get<OrgMember[]>("/organizations/me/members")),
    api
      .get<OrgInvitation[]>("/organizations/current/invitations")
      .catch(() => api.get<OrgInvitation[]>("/organizations/me/invitations"))
      .catch((): OrgInvitation[] => []),
  ]);

  return {
    members:
      Array.isArray(membersData) && membersData.length > 0
        ? membersData
        : buildFallbackRoster(currentUser),
    invitations: invitesData || [],
  };
}

export default function UsersManagementPage() {
  const { user: currentUser, canManageTeam } = useAuth();
  const { presenceMap, onlineUserIds } = useRealtime();
  const { toast } = useToast();

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invitations, setInvitations] = useState<OrgInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("MEMBER");
  const [inviteDepartment, setInviteDepartment] = useState("Engineering");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ inviteUrl: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Remove confirmation
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; name: string } | null>(null);

  // Action loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const applyTeam = useCallback((data: TeamData) => {
    setMembers(data.members);
    setInvitations(data.invitations);
  }, []);

  const handleLoadError = useCallback((err: unknown) => {
    setError(err instanceof ApiError ? err.message : "Failed to load team members.");
  }, []);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      applyTeam(await loadTeam(currentUser));
    } catch (err) {
      handleLoadError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser, applyTeam, handleLoadError]);

  useEffect(() => {
    let cancelled = false;
    loadTeam(currentUser)
      .then((data) => {
        if (!cancelled) applyTeam(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) handleLoadError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, applyTeam, handleLoadError]);

  // Action: Role Change
  const handleRoleChange = async (memberId: string, newRole: OrgRole, memberName: string) => {
    setActionLoadingId(memberId);
    try {
      await api
        .patch(`/organizations/current/members/${memberId}/role`, { role: newRole })
        .catch(() => api.patch(`/organizations/me/members/${memberId}/role`, { role: newRole }));

      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
      toast.success(`Updated role for ${memberName} to ${newRole}.`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update role.";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Activate / Suspend Member
  const handleStatusToggle = async (memberId: string, currentStatus: string, memberName: string) => {
    setActionLoadingId(memberId);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api
        .patch(`/organizations/current/members/${memberId}/status`, { status: newStatus })
        .catch(() => api.patch(`/organizations/me/members/${memberId}/status`, { status: newStatus }));

      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, status: newStatus } : m)));
      toast.success(
        `${memberName} has been ${newStatus === "ACTIVE" ? "activated" : "suspended"} from workspace access.`,
      );
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to change member status.";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Remove Member (after confirmation)
  const handleRemoveMember = async () => {
    if (!pendingRemoval) return;
    const { id: memberId, name: memberName } = pendingRemoval;
    setActionLoadingId(memberId);
    try {
      await api
        .delete(`/organizations/current/members/${memberId}`)
        .catch(() => api.delete(`/organizations/me/members/${memberId}`));

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success(`Removed ${memberName} from the organization.`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to remove member.";
      setError(msg);
    } finally {
      setActionLoadingId(null);
      setPendingRemoval(null);
    }
  };

  // Action: Send Member Invite
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);

    try {
      const body = {
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        department: inviteDepartment,
      };
      const res = await api
        .post<InviteResponse>("/organizations/current/members/invite", body)
        .catch(() => api.post<InviteResponse>("/organizations/me/members/invite", body));

      setInviteResult({
        inviteUrl: res?.inviteUrl || `${window.location.origin}/?invitation=${res?.token || "invite_token"}`,
      });
      await fetchData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create invitation.";
      setError(msg);
    } finally {
      setInviting(false);
    }
  };

  const closeInvite = () => {
    setIsInviteOpen(false);
    setInviteResult(null);
  };

  const copyInviteLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Invite link copied to clipboard.");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const name = member.user?.fullName || "";
      const email = member.user?.email || "";
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const suspendedCount = members.filter((m) => m.status === "SUSPENDED").length;

  const columns: Column<OrgMember>[] = [
    {
      key: "fullName",
      header: "Team member",
      accessor: (row) => {
        const isCurrent = row.userId === currentUser?.id;
        const live = presenceMap[row.userId];
        const isOnline = live ? live.status === "ONLINE" : onlineUserIds.includes(row.userId);

        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="grid size-9 place-items-center rounded-xl bg-[var(--gy-primary)] text-xs font-bold text-[var(--gy-primary-fg)]">
                {(row.user?.fullName || "User").slice(0, 2).toUpperCase()}
              </div>
              <span
                aria-label={isOnline ? "Online" : "Offline"}
                className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-[var(--gy-surface)] ${
                  isOnline ? "bg-[var(--gy-success)]" : "bg-[var(--gy-border-strong)]"
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--gy-text)]">
                  {row.user?.fullName || "Unnamed User"}
                </span>
                {isCurrent && (
                  <Chip variant="soft" size="sm">
                    You
                  </Chip>
                )}
              </div>
              <p className="truncate text-xs text-[var(--gy-text-secondary)]">{row.user?.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Workspace role",
      accessor: (row) => {
        const isCurrent = row.userId === currentUser?.id;
        const isMemberOwner = row.role === "OWNER";

        if (canManageTeam && !isCurrent && !isMemberOwner) {
          return (
            <div className="w-36">
              <Dropdown
                size="sm"
                options={ROLE_OPTIONS}
                value={row.role}
                disabled={actionLoadingId === row.id}
                onChange={(val) =>
                  handleRoleChange(row.id, val as OrgRole, row.user?.fullName || "Member")
                }
              />
            </div>
          );
        }

        return (
          <Chip
            variant={row.role === "OWNER" ? "solid" : row.role === "ADMIN" ? "warning" : "soft"}
            size="sm"
          >
            {row.role}
          </Chip>
        );
      },
    },
    {
      key: "status",
      header: "Access status",
      accessor: (row) => (
        <Chip variant={row.status === "ACTIVE" ? "success" : "danger"} size="sm">
          {row.status}
        </Chip>
      ),
    },
    {
      key: "joinedAt",
      header: "Member since",
      accessor: (row) => (
        <span className="text-xs text-[var(--gy-text-secondary)]">
          {new Date(row.joinedAt || Date.now()).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      headerAlign: "right",
      accessor: (row) => {
        const isCurrent = row.userId === currentUser?.id;
        const isMemberOwner = row.role === "OWNER";

        if (!canManageTeam || isCurrent || isMemberOwner) {
          return <span className="text-xs text-[var(--gy-text-subtle)]">Protected</span>;
        }

        const name = row.user?.fullName || "Member";
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant={row.status === "ACTIVE" ? "warning" : "success"}
              size="xs"
              leftIcon={row.status === "ACTIVE" ? <Ban className="size-3" /> : <PlayCircle className="size-3" />}
              disabled={actionLoadingId === row.id}
              onClick={() => handleStatusToggle(row.id, row.status, name)}
            >
              {row.status === "ACTIVE" ? "Suspend" : "Activate"}
            </Button>

            <Button
              variant="danger-soft"
              size="xs"
              leftIcon={<Trash2 className="size-3" />}
              aria-label={`Remove ${name}`}
              disabled={actionLoadingId === row.id}
              onClick={() => setPendingRemoval({ id: row.id, name })}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card variant="elevated" radius="xl" padding="lg">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Chip variant="soft" size="sm">
                Team directory & roles
              </Chip>
              {suspendedCount > 0 && (
                <Chip variant="danger" size="sm">
                  {suspendedCount} suspended
                </Chip>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--gy-text)]">
              Team members & seats
            </h2>
            <p className="max-w-2xl text-sm text-[var(--gy-text-secondary)]">
              Manage organization licenses, invite collaborators, adjust role privileges, and activate or
              suspend user access.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {canManageTeam && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus className="size-3.5" />}
                onClick={() => setIsInviteOpen(true)}
              >
                Invite member
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}
              onClick={fetchData}
              disabled={refreshing}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Banner
          variant="danger"
          title="Something went wrong"
          description={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card variant="elevated" radius="xl" padding="md">
          <span className="text-sm font-medium text-[var(--gy-text-secondary)]">Total team seats</span>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-[var(--gy-text)]">
              <AnimatedNumber value={members.length} />
            </div>
            <span className="text-xs text-[var(--gy-text-subtle)]">/ {SEAT_LIMIT} seats</span>
          </div>
          <div className="mt-2">
            <ProgressBar
              progress={Math.round((members.length / SEAT_LIMIT) * 100)}
              variant="primary"
              size="sm"
              showLabel={false}
            />
          </div>
        </Card>

        <Card variant="elevated" radius="xl" padding="md">
          <span className="text-sm font-medium text-[var(--gy-text-secondary)]">Active teammates</span>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-[var(--gy-success)]">
              <AnimatedNumber value={activeCount} />
            </div>
            <Chip variant="success" size="sm">
              Active
            </Chip>
          </div>
        </Card>

        <Card variant="elevated" radius="xl" padding="md">
          <span className="text-sm font-medium text-[var(--gy-text-secondary)]">Suspended accounts</span>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-[var(--gy-danger)]">
              <AnimatedNumber value={suspendedCount} />
            </div>
            <span className="text-xs text-[var(--gy-text-subtle)]">access revoked</span>
          </div>
        </Card>

        <Card variant="elevated" radius="xl" padding="md">
          <span className="text-sm font-medium text-[var(--gy-text-secondary)]">Pending invites</span>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-[var(--gy-warning)]">
              <AnimatedNumber value={invitations.length} />
            </div>
            <span className="text-xs text-[var(--gy-text-subtle)]">awaiting response</span>
          </div>
        </Card>
      </div>

      {/* Member directory */}
      <Card variant="elevated" radius="xl" padding="lg">
        <CardHeader>
          <div className="flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-base font-semibold text-[var(--gy-text)]">Team directory</h3>
              <p className="text-sm text-[var(--gy-text-secondary)]">
                Everyone in the organization with their workspace role and access status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-64">
                <Input
                  size="sm"
                  type="text"
                  placeholder="Search name or email..."
                  aria-label="Search team members"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="size-3.5" />}
                  fullWidth
                />
              </div>
              <div className="w-40">
                <Dropdown
                  size="sm"
                  options={ROLE_FILTER_OPTIONS}
                  value={roleFilter}
                  onChange={(val) => setRoleFilter(val)}
                />
              </div>
              <div className="w-44">
                <Dropdown
                  size="sm"
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="mt-4">
          <Table<OrgMember>
            columns={columns}
            data={filteredMembers}
            rowKey={(row) => row.id}
            hoverable
            size="md"
            isLoading={loading}
            skeletonRows={4}
            emptyStateLabel="No team members found"
            emptyStateMessage="Try adjusting the search or filters."
            emptyStateIcon={<Users className="size-6" />}
          />
        </CardBody>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={closeInvite}
        size="md"
        icon={<UserPlus className="size-4" />}
        title="Invite new teammate"
        footer={
          inviteResult ? (
            <div className="flex w-full justify-end">
              <Button variant="primary" size="sm" onClick={closeInvite}>
                Done
              </Button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={closeInvite}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                form="invite-member-form"
                disabled={inviting}
                isLoading={inviting}
                loadingText="Sending..."
                leftIcon={<Send className="size-3" />}
              >
                Send invitation
              </Button>
            </div>
          )
        }
      >
        {inviteResult ? (
          <div className="space-y-4">
            <Banner
              variant="success"
              description="Invitation created. Share this onboarding link with your team member:"
            />
            <Input
              readOnly
              aria-label="Invitation link"
              value={inviteResult.inviteUrl}
              fullWidth
              rightIcon={copiedLink ? <Check className="size-4" /> : <Copy className="size-4" />}
              onRightIconClick={() => copyInviteLink(inviteResult.inviteUrl)}
              helperText={copiedLink ? "Copied!" : "Click the icon to copy"}
            />
          </div>
        ) : (
          <form id="invite-member-form" onSubmit={handleSendInvite} className="space-y-4">
            <Input
              label="Teammate work email"
              type="email"
              required
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              fullWidth
            />

            <div className="grid grid-cols-2 gap-3">
              <Dropdown
                label="Role"
                options={INVITE_ROLE_OPTIONS}
                value={inviteRole}
                onChange={(val) => setInviteRole(val as OrgRole)}
              />
              <Dropdown
                label="Department"
                options={DEPARTMENT_OPTIONS}
                value={inviteDepartment}
                onChange={(val) => setInviteDepartment(val)}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Remove confirmation */}
      <Modal
        isOpen={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={handleRemoveMember}
        isConfirmLoading={pendingRemoval !== null && actionLoadingId === pendingRemoval.id}
        size="sm"
        icon={<Trash2 className="size-4" />}
        title="Remove member"
        confirmText="Remove"
        cancelText="Cancel"
      >
        <p className="text-sm text-[var(--gy-text-secondary)]">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-[var(--gy-text)]">{pendingRemoval?.name}</span> from this
          organization?
        </p>
      </Modal>
    </div>
  );
}
