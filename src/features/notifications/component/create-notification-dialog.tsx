"use client";

import React, { useRef } from "react";
import { Button, Input, Modal, Typography } from "@galyan/ui";
import { BellPlus, Radio } from "lucide-react";
import { useNotifications } from "@/features/notifications/context";
import type { NotificationCategory } from "@/features/notifications/types/api";

export const CreateNotificationDialog: React.FC = () => {
  const { state, toggleCreateModal, createNotification } = useNotifications();
  const { isCreateOpen, isSubmitting } = state;
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string)?.trim();
    const body = (formData.get("body") as string)?.trim();
    const category = (formData.get("category") as NotificationCategory) || "system";
    const actionLabel = (formData.get("actionLabel") as string)?.trim() || undefined;
    const actionUrl = (formData.get("actionUrl") as string)?.trim() || undefined;

    if (!title || !body) return;

    try {
      await createNotification({
        title,
        body,
        category,
        type: `admin_${category}_alert`,
        actionLabel,
        actionUrl,
      });
      formRef.current?.reset();
    } catch {
      // Error handled by context
    }
  };

  return (
    <Modal
      isOpen={isCreateOpen}
      onClose={() => toggleCreateModal(false)}
      size="md"
      variant="glassmorphic"
      icon={<BellPlus className="size-5 text-[var(--gy-primary)]" />}
      title="Dispatch Real-Time Alert"
      subtitle="Broadcast a real-time persistent notification across all connected user devices and sessions via Socket.IO."
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--gy-text)]">
            Alert Title <span className="text-rose-500">*</span>
          </label>
          <Input
            name="title"
            required
            size="sm"
            placeholder="e.g. Critical Security Update: 2FA Enforced"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--gy-text)]">
            Alert Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Detailed description of the incident, maintenance window, or announcement..."
            className="w-full rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface)] px-3 py-2 text-xs text-[var(--gy-text)] placeholder:text-[var(--gy-text-subtle)] focus:border-[var(--gy-primary)] focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--gy-text)]">
              Category
            </label>
            <select
              name="category"
              defaultValue="system"
              className="w-full rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface)] px-3 py-2 text-xs text-[var(--gy-text)] focus:border-[var(--gy-primary)] focus:outline-none transition-colors"
            >
              <option value="system">System & Infrastructure</option>
              <option value="security">Security & Access</option>
              <option value="workspace">Workplace & Office</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--gy-text)]">
              Action Label (Optional)
            </label>
            <Input
              name="actionLabel"
              size="sm"
              placeholder="e.g. Review Security"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--gy-text)]">
            Action URL (Optional)
          </label>
          <Input
            name="actionUrl"
            size="sm"
            placeholder="e.g. /organization/security"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--gy-primary)]/20 bg-[var(--gy-primary)]/5 p-3 text-[11px] text-[var(--gy-text-secondary)]">
          <Radio className="size-4 shrink-0 text-[var(--gy-primary)] animate-pulse" />
          <Typography variant="span" className="text-[11px]">
            This alert will be instantly saved to MongoDB and pushed live to active clients via WebSocket room channels.
          </Typography>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--gy-border)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toggleCreateModal(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<BellPlus className="size-3.5" />}
          >
            Dispatch Now
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateNotificationDialog;
