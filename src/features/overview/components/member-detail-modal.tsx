"use client";

import React from "react";
import { Modal, Chip, type ChipVariant } from "@galyan/ui";
import type { TeamMember, PresenceStatus } from "@/features/overview/types";

export interface MemberDetailModalProps {
  member: TeamMember | null;
  canInvite: boolean;
  onClose: () => void;
  onManage: () => void;
}

function presenceChipVariant(status?: PresenceStatus): ChipVariant {
  switch (status) {
    case "ONLINE":
      return "success";
    case "IN_MEETING":
    case "BUSY":
      return "soft";
    case "AWAY":
      return "warning";
    default:
      return "neutral";
  }
}

function roleChipVariant(role: string): ChipVariant {
  if (role === "OWNER") return "danger";
  if (role === "ADMIN") return "warning";
  return "soft";
}

function formatPresence(status?: PresenceStatus): string {
  return (status || "OFFLINE").replace("_", " ");
}

export function MemberDetailModal({
  member,
  canInvite,
  onClose,
  onManage,
}: MemberDetailModalProps) {
  return (
    <Modal
      isOpen={member !== null}
      onClose={onClose}
      title={member?.fullName}
      subtitle={member?.email}
      size="sm"
      confirmText={canInvite ? "Open user management" : "Close"}
      cancelText="Close"
      onCancel={onClose}
      onConfirm={() => {
        onClose();
        if (canInvite) onManage();
      }}
    >
      {member && (
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <dt className="text-[var(--gy-text-secondary)]">Presence</dt>
          <dd>
            <Chip variant={presenceChipVariant(member.presenceStatus)} size="sm">
              {formatPresence(member.presenceStatus)}
            </Chip>
          </dd>
          <dt className="text-[var(--gy-text-secondary)]">Role</dt>
          <dd>
            <Chip variant={roleChipVariant(member.role)} size="sm">
              {member.role}
            </Chip>
          </dd>
          <dt className="text-[var(--gy-text-secondary)]">Department</dt>
          <dd className="text-[var(--gy-text)] font-medium">{member.department || "Engineering"}</dd>
          <dt className="text-[var(--gy-text-secondary)]">Last activity</dt>
          <dd className="text-[var(--gy-text)] font-medium">{member.lastActive || "Recently"}</dd>
        </dl>
      )}
    </Modal>
  );
}
