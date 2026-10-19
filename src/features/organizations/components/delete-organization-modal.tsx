"use client";

import { useState } from "react";
import { Button, Checkbox, Input, Modal } from "@galyan/ui";
import { Trash2 } from "lucide-react";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { useOrganizationsContext } from "@/features/organizations/context";
import type { AdminOrganization } from "@/features/organizations/types";

const DeleteForm = ({ org }: { org: AdminOrganization }) => {
  const { canHardDelete, closeDelete, submitDelete } = useOrganizationsContext();
  const [hard, setHard] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const alreadyDeleted = org.status === "DELETED";
  // A deleted organization can only be removed permanently
  const permanent = hard || alreadyDeleted;
  const confirmed = !permanent || confirmName.trim() === org.name;

  const submit = async () => {
    setSubmitting(true);
    const ok = await submitDelete(org.id, permanent);
    if (!ok) setSubmitting(false);
  };

  return (
    <Modal
      isOpen
      onClose={submitting ? () => undefined : closeDelete}
      size="sm"
      icon={<Trash2 className="size-4" />}
      title={`Delete ${org.name}?`}
      subtitle={`Owner: ${org.owner.email}`}
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={closeDelete} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="w-full sm:w-auto"
            isLoading={submitting}
            disabled={!confirmed}
            onClick={() => void submit()}
          >
            {permanent ? "Delete permanently" : "Delete organization"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-[var(--gy-text-secondary)]">
        <div className={`${GLASS_ROW} px-3 py-2.5`}>
          {permanent ? (
            <>
              The organization, its {org.memberCount} membership
              {org.memberCount === 1 ? "" : "s"}, subscription, invoices,
              payments and virtual office are removed for good. User accounts
              are kept. This can&apos;t be undone.
            </>
          ) : (
            <>
              The organization is marked <strong>Deleted</strong> and its
              members lose access. You can restore it later by activating it.
            </>
          )}
        </div>

        {canHardDelete && !alreadyDeleted && (
          <Checkbox
            size="sm"
            checked={hard}
            onChange={(e) => setHard(e.target.checked)}
            label="Delete permanently"
            description="Superadmin only"
          />
        )}

        {permanent &&
          (canHardDelete ? (
            <Input
              label={`Type “${org.name}” to confirm`}
              size="sm"
              fullWidth
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
            />
          ) : (
            <p className="text-xs">
              Only a superadmin can delete an organization permanently.
            </p>
          ))}
      </div>
    </Modal>
  );
}

export const DeleteOrganizationModal = () => {
  const { state } = useOrganizationsContext();
  const org = state.deleteDialog;
  if (!org) return null;
  return <DeleteForm key={org.id} org={org} />;
};
