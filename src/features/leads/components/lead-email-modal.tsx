"use client";

import { useState } from "react";
import { Button, Input, Modal, Textarea } from "@galyan/ui";
import { Mail, Send } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useLeadsContext } from "@/features/leads/context";
import { leadEmailSchema, type LeadDetail } from "@/features/leads/types";

const defaultDraft = (lead: LeadDetail) => {
  const topic = lead.interest ? ` about ${lead.interest.toLowerCase()}` : "";
  return {
    subject: lead.company ? `Simantrix for ${lead.company}` : "Following up on your Simantrix enquiry",
    body: `Thanks for reaching out${topic}. I'd love to set up a short call to understand your team and show you around Simantrix.\n\nWould any of these times work for you this week?\n\n`,
  };
};

/** Writes to the lead from the console. Replies go to the sender's own inbox. */
export const LeadEmailModal = ({ lead }: { lead: LeadDetail }) => {
  const { user } = useAuth();
  const { state, setDialog, sendEmail } = useLeadsContext();
  const [draft, setDraft] = useState(() => defaultDraft(lead));
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({});

  const submit = async () => {
    const parsed = leadEmailSchema.safeParse(draft);
    if (!parsed.success) {
      const next: { subject?: string; body?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "subject" | "body";
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    await sendEmail(parsed.data);
  };

  return (
    <Modal
      isOpen
      onClose={state.saving ? undefined : () => setDialog(null)}
      size="lg"
      icon={<Mail className="size-4" />}
      title={`Email ${lead.name || lead.email}`}
      subtitle={`To ${lead.email} · replies go to ${user?.email ?? "you"}`}
      preventBackdropClose={state.saving}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDialog(null)} disabled={state.saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send className="size-3.5" />}
            isLoading={state.saving}
            onClick={() => void submit()}
          >
            Send email
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Input
          label="Subject"
          size="sm"
          value={draft.subject}
          hasError={Boolean(errors.subject)}
          helperText={errors.subject}
          onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
        />
        <Textarea
          label="Message"
          size="sm"
          rows={10}
          value={draft.body}
          hasError={Boolean(errors.body)}
          helperText={errors.body ?? "Sent with the Simantrix email layout and your name as signature."}
          maxCharCount={10000}
          onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
        />
      </div>
    </Modal>
  );
};
