"use client";

import dynamic from "next/dynamic";
import { Banner } from "@galyan/ui";
import { useUsersContext } from "@/features/users/context";
import { UsersHeader } from "@/features/users/components/users-header";
import { UsersKpis } from "@/features/users/components/users-kpis";
import { UsersTable } from "@/features/users/components/users-table";

const InviteMemberModal = dynamic(
  () =>
    import("@/features/users/components/invite-member-modal").then(
      (m) => m.InviteMemberModal,
    ),
  { ssr: false },
);

const MemberSettingsModal = dynamic(
  () =>
    import("@/features/users/components/member-settings-modal").then(
      (m) => m.MemberSettingsModal,
    ),
  { ssr: false },
);

const RemoveMemberModal = dynamic(
  () =>
    import("@/features/users/components/remove-member-modal").then(
      (m) => m.RemoveMemberModal,
    ),
  { ssr: false },
);

export const UsersContent = () => {
  const { state, dismissError } = useUsersContext();
  const { error } = state;

  return (
    <div className="space-y-6">
      <UsersHeader />

      {error && (
        <Banner
          variant="danger"
          title="Something went wrong"
          description={error}
          dismissible
          onDismiss={dismissError}
        />
      )}

      <UsersKpis />

      <UsersTable />

      <InviteMemberModal />

      <MemberSettingsModal />

      <RemoveMemberModal />
    </div>
  );
};
