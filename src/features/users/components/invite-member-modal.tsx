"use client";

import React from "react";
import {
  Modal,
  Button,
  Banner,
  Input,
  Dropdown,
  Tabs,
} from "@galyan/ui";
import {
  UserPlus,
  UserCheck,
  Send,
  Link as LinkIcon,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import type { OrgRole } from "@/types/dashboard";
import {
  INVITE_ROLE_OPTIONS,
  DEPARTMENT_OPTIONS,
} from "@/features/users/types/api";
import { useUsersContext } from "@/features/users/context";

export function InviteMemberModal() {
  const {
    state,
    closeInviteDialog,
    setInviteTab,
    setInviteEmail,
    setDirectName,
    setDirectPassword,
    toggleInviteShowPassword,
    setInviteRole,
    setInviteDepartment,
    sendInvite,
    directAdd,
    copyInviteLink,
    dismissInviteError,
  } = useUsersContext();

  const { inviteDialog, allowedEmailDomains } = state;
  const {
    isOpen,
    tab,
    email,
    fullName,
    password,
    showPassword,
    role,
    department,
    isInviting,
    inviteResult,
    directResult,
    copiedLink,
    error,
  } = inviteDialog;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeInviteDialog}
      size="md"
      icon={<UserPlus className="size-4" />}
      title={
        inviteResult || directResult
          ? "Teammate Added"
          : "Add or invite teammate"
      }
      footer={
        inviteResult || directResult ? (
          <div className="flex w-full justify-end">
            <Button variant="primary" size="sm" onClick={closeInviteDialog}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row w-full items-stretch sm:items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={closeInviteDialog}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              form={tab === "link" ? "invite-member-form" : "direct-member-form"}
              disabled={isInviting}
              isLoading={isInviting}
              loadingText={tab === "link" ? "Sending..." : "Adding..."}
              className="w-full sm:w-auto"
              leftIcon={
                tab === "link" ? (
                  <Send className="size-3" />
                ) : (
                  <UserCheck className="size-3" />
                )
              }
            >
              {tab === "link" ? "Send invitation" : "Add teammate directly"}
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
            rightIcon={
              copiedLink ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )
            }
            onRightIconClick={() => copyInviteLink(inviteResult.inviteUrl)}
            helperText={copiedLink ? "Copied!" : "Click the icon to copy"}
          />
        </div>
      ) : directResult ? (
        <div className="space-y-4">
          <Banner
            variant="success"
            description={`Team member ${directResult.fullName} (${directResult.email}) was directly added to your organization! They can now log in at the digital workplace.`}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <Banner
              variant="danger"
              title="Unable to complete request"
              description={error}
              dismissible
              onDismiss={dismissInviteError}
            />
          )}

          <Tabs
            items={[
              {
                id: "link",
                label: "Invite via link",
                icon: <LinkIcon className="size-3.5" />,
              },
              {
                id: "direct",
                label: "Directly add member",
                icon: <UserPlus className="size-3.5" />,
              },
            ]}
            activeTab={tab}
            onTabChange={(t) => setInviteTab(t as "link" | "direct")}
            variant="card"
            size="sm"
            fullWidth
          />

          {tab === "link" ? (
            <form
              id="invite-member-form"
              onSubmit={sendInvite}
              className="space-y-4"
            >
              <Input
                label="Teammate work email"
                type="email"
                required
                placeholder="teammate@company.com"
                value={email}
                onChange={(e) => setInviteEmail(e.target.value)}
                fullWidth
                helperText={
                  allowedEmailDomains.length > 0
                    ? `Allowed organization domains: ${allowedEmailDomains.map((d) => "@" + d).join(", ")}`
                    : undefined
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Dropdown
                  label="Role"
                  options={INVITE_ROLE_OPTIONS}
                  value={role}
                  onChange={(val) => setInviteRole(val as OrgRole)}
                />
                <Dropdown
                  label="Department"
                  options={DEPARTMENT_OPTIONS}
                  value={department}
                  onChange={(val) => setInviteDepartment(val)}
                />
              </div>
            </form>
          ) : (
            <form
              id="direct-member-form"
              onSubmit={directAdd}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                type="text"
                required
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setDirectName(e.target.value)}
                fullWidth
              />

              <Input
                label="Teammate work email"
                type="email"
                required
                placeholder="teammate@company.com"
                value={email}
                onChange={(e) => setInviteEmail(e.target.value)}
                fullWidth
                helperText={
                  allowedEmailDomains.length > 0
                    ? `Allowed organization domains: ${allowedEmailDomains.map((d) => "@" + d).join(", ")}`
                    : undefined
                }
              />

              <Input
                label="Initial Password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setDirectPassword(e.target.value)}
                fullWidth
                rightIcon={
                  showPassword ? (
                    <EyeOff className="size-4 text-[var(--gy-text-subtle)] hover:text-[var(--gy-text)] transition-colors cursor-pointer" />
                  ) : (
                    <Eye className="size-4 text-[var(--gy-text-subtle)] hover:text-[var(--gy-text)] transition-colors cursor-pointer" />
                  )
                }
                onRightIconClick={toggleInviteShowPassword}
                helperText="Employee can use this to sign in immediately at the digital workplace"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Dropdown
                  label="Role"
                  options={INVITE_ROLE_OPTIONS}
                  value={role}
                  onChange={(val) => setInviteRole(val as OrgRole)}
                />
                <Dropdown
                  label="Department"
                  options={DEPARTMENT_OPTIONS}
                  value={department}
                  onChange={(val) => setInviteDepartment(val)}
                />
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}
