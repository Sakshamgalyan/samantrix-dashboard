"use client";

import { Button, Dropdown, Input, Modal } from "@galyan/ui";
import { Mail, UserPlus } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { useDevelopersContext } from "@/features/developers/context";
import { useGetAdminOrganizationsQuery } from "@/features/organizations/context/api";

const ORG_ROLE_OPTIONS = [
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "OWNER", label: "Owner" },
  { value: "VIEWER", label: "Viewer" },
];

export const InviteDeveloperModal = () => {
  const {
    state,
    roleOptions,
    closeInviteModal,
    patchInviteForm,
    submitInvite,
  } = useDevelopersContext();
  const { isInviteOpen, inviteForm, inviting } = state;

  const { data: orgsData } = useGetAdminOrganizationsQuery(
    { page: 1, limit: 100 },
    { skip: !isInviteOpen },
  );

  const orgOptions = [
    { value: "", label: "None (Developer account only)" },
    ...(orgsData?.data || []).map((o) => ({
      value: o.id,
      label: o.name,
    })),
  ];

  return (
    <Modal
      isOpen={isInviteOpen}
      onClose={closeInviteModal}
      size="md"
      title="Invite Developer"
      subtitle="Send an invitation email with console access"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={closeInviteModal}
            disabled={inviting}
            fullWidth
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="size-3.5" />}
            isLoading={inviting}
            onClick={submitInvite}
            fullWidth
            className="sm:w-auto"
          >
            Send Invitation
          </Button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitInvite();
        }}
        className="space-y-3.5"
      >
        <Input
          size="sm"
          label="Email address"
          type="email"
          required
          placeholder="developer@simantrix.com"
          leftIcon={<Mail className="size-3.5" />}
          value={inviteForm.email}
          onChange={(e) => patchInviteForm({ email: e.target.value })}
          fullWidth
          autoFocus
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            size="sm"
            label="Full name (optional)"
            placeholder="Jane Doe"
            value={inviteForm.fullName}
            onChange={(e) => patchInviteForm({ fullName: e.target.value })}
            fullWidth
          />
          <Input
            size="sm"
            label="Phone (optional)"
            placeholder="+91 98765 43210"
            value={inviteForm.phone}
            onChange={(e) => patchInviteForm({ phone: e.target.value })}
            fullWidth
          />
        </div>

        <Dropdown
          size="sm"
          label="Platform Role"
          options={roleOptions}
          value={inviteForm.role}
          onChange={(v) => patchInviteForm({ role: v as string })}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Dropdown
            size="sm"
            label="Link Organization (optional)"
            options={orgOptions}
            value={inviteForm.organizationId || ""}
            onChange={(v) => patchInviteForm({ organizationId: v as string })}
          />
          {inviteForm.organizationId && (
            <Dropdown
              size="sm"
              label="Organization Role"
              options={ORG_ROLE_OPTIONS}
              value={inviteForm.orgRole || "MEMBER"}
              onChange={(v) => patchInviteForm({ orgRole: v as string })}
            />
          )}
        </div>

        <Input
          size="sm"
          label="Temporary password (optional)"
          type="password"
          placeholder="Leave blank to auto-generate"
          value={inviteForm.password}
          onChange={(e) => patchInviteForm({ password: e.target.value })}
          fullWidth
        />

        <div
          className={`${GLASS_ROW} px-3 py-2 text-xs text-[var(--gy-text-secondary)]`}
        >
          An email will be dispatched to this address with console access
          details and sign-in instructions.
        </div>
      </form>
    </Modal>
  );
};
