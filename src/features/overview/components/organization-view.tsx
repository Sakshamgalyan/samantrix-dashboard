"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useRealtime } from "@/features/realtime";
import { pageParams } from "@/features/common/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetOrgMembersQuery } from "@/features/users/context/api";
import type { TeamMemberRecord } from "@/features/users/types/api";
import { useGetOrgAnalyticsOverviewQuery } from "@/features/analytics/context/api";
import { useOverview } from "@/features/overview/context";
import { setSearchTerm, setPage, setSelectedMember } from "@/features/overview/context/action";
import { WEEKLY_ATTENDANCE_MOCK, DEPARTMENT_DATA_MOCK } from "@/features/overview/common/constants";
import type { TeamMember } from "@/features/overview/types";
import { OrganizationKpis } from "@/features/overview/components/organization-kpis";
import { OrganizationCollaborationCharts } from "@/features/overview/components/organization-collaboration-charts";
import { OrganizationDepartmentOffice } from "@/features/overview/components/organization-department-office";
import { OrganizationMembersTable } from "@/features/overview/components/organization-members-table";
import { MemberDetailModal } from "@/features/overview/components/member-detail-modal";

function toTeamMember(m: TeamMemberRecord): TeamMember {
  return {
    id: m.id,
    userId: m.userId,
    fullName: m.fullName || "Team Member",
    email: m.email,
    role: m.role || "MEMBER",
    department: m.department || undefined,
    status: (m.status as TeamMember["status"]) || "ACTIVE",
    presenceStatus: "OFFLINE",
  };
}

export function OrganizationView() {
  const router = useRouter();
  const { user, isOwner, isAdmin } = useAuth();
  const { presenceMap, onlineUserIds } = useRealtime();
  const { state, dispatch } = useOverview();
  const { searchTerm, page, selectedMember } = state;

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Stable query params to avoid duplicate re-fetches on parent renders
  const membersQueryArgs = useMemo(
    () => pageParams(page, { search: debouncedSearch }),
    [page, debouncedSearch],
  );

  // Skip queries if user is not loaded yet (prevents 401s and double-fetches)
  const analyticsQuery = useGetOrgAnalyticsOverviewQuery(undefined, { skip: !user });
  const membersQuery = useGetOrgMembersQuery(membersQueryArgs, { skip: !user });

  const analytics = analyticsQuery.data;
  const totalMembers = analytics?.totalMembers ?? 0;
  const activeMembers = analytics?.activeMembers ?? 0;
  const membersData = membersQuery.data;
  const members = useMemo<TeamMember[]>(() => (membersData?.data ?? []).map(toTeamMember), [membersData]);
  const loading = membersQuery.isLoading;
  const canInvite = isOwner || isAdmin;

  // Real-time presence enhancement
  const enhancedMembers = useMemo(() => {
    return members.map((m) => {
      const live = presenceMap[m.userId];
      if (live) {
        return { ...m, presenceStatus: live.status, lastActive: "Active now" };
      }
      if (onlineUserIds.includes(m.userId)) {
        return { ...m, presenceStatus: "ONLINE" as const, lastActive: "Active now" };
      }
      return m;
    });
  }, [members, presenceMap, onlineUserIds]);

  // Presence breakdown calculation with accurate values and stable chart rendering
  const presenceBreakdown = useMemo(() => {
    let onlineCount = 0;
    let inMeetingCount = 0;
    let awayCount = 0;
    const seen = new Set<string>();

    Object.values(presenceMap).forEach((p) => {
      seen.add(p.userId);
      switch (p.status) {
        case "ONLINE":
          onlineCount++;
          break;
        case "IN_MEETING":
        case "BUSY":
          inMeetingCount++;
          break;
        case "AWAY":
          awayCount++;
          break;
      }
    });
    onlineUserIds.forEach((id) => {
      if (!seen.has(id)) onlineCount++;
    });
    const offlineCount = Math.max(totalMembers - onlineCount - inMeetingCount - awayCount, 0);

    return [
      { name: "Online now", value: onlineCount, color: "var(--gy-success)", dot: "bg-[var(--gy-success)]" },
      { name: "In meeting", value: inMeetingCount, color: "var(--gy-primary)", dot: "bg-[var(--gy-primary)]" },
      { name: "Away", value: awayCount, color: "var(--gy-warning)", dot: "bg-[var(--gy-warning)]" },
      { name: "Offline", value: offlineCount, color: "var(--gy-text-subtle)", dot: "bg-[var(--gy-text-subtle)]" },
    ];
  }, [presenceMap, onlineUserIds, totalMembers]);

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      <OrganizationKpis
        analytics={analytics}
        onlineCount={onlineUserIds.length}
        loading={analyticsQuery.isLoading}
      />

      <OrganizationCollaborationCharts
        weeklyAttendanceData={WEEKLY_ATTENDANCE_MOCK}
        presenceBreakdown={presenceBreakdown}
      />

      <OrganizationDepartmentOffice
        departmentData={DEPARTMENT_DATA_MOCK}
        activeMembers={activeMembers}
        onlineCount={onlineUserIds.length}
      />

      <OrganizationMembersTable
        members={enhancedMembers}
        loading={loading}
        searchTerm={searchTerm}
        meta={membersData?.meta}
        canInvite={canInvite}
        onSearchChange={(val) => dispatch(setSearchTerm(val))}
        onPageChange={(p) => dispatch(setPage(p))}
        onSelectMember={(m) => dispatch(setSelectedMember(m))}
      />

      <MemberDetailModal
        member={selectedMember}
        canInvite={canInvite}
        onClose={() => dispatch(setSelectedMember(null))}
        onManage={() => router.push("/organization/users")}
      />
    </div>
  );
}
