"use client";

import dynamic from "next/dynamic";
import { Button, Chip, Modal, Skeleton, Typography } from "@galyan/ui";
import { FileText, Mail, Trash2 } from "lucide-react";
import { useLeadsContext } from "@/features/leads/context";
import { STATUS_META, TYPE_LABEL, leadName } from "@/features/leads/common/constants";
import { LeadContactCard } from "@/features/leads/components/lead-contact-card";
import { LeadDealPanel } from "@/features/leads/components/lead-deal-panel";
import { LeadTimeline, LogActivityForm, TimelinePager } from "@/features/leads/components/lead-activity-log";
import { LeadQuotesList } from "@/features/leads/components/lead-quotes-list";

const LeadEmailModal = dynamic(
  () => import("@/features/leads/components/lead-email-modal").then((m) => m.LeadEmailModal),
  { ssr: false },
);
const LeadQuoteModal = dynamic(
  () => import("@/features/leads/components/lead-quote-modal").then((m) => m.LeadQuoteModal),
  { ssr: false },
);

const Section = ({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) => {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <Typography variant="label" weight="semibold" textColor="var(--gy-text-secondary)" className="text-xs uppercase tracking-wide">
          {title}
        </Typography>
        {aside}
      </div>
      {children}
    </section>
  );
};

/** Side panel for one lead: contact, deal fields, quotes, logging and the timeline. */
export const LeadDetailDrawer = () => {
  const { state, permissions, closeDetail, setDialog, deleteLead, openLead } = useLeadsContext();
  const detail = state.detail;
  const lead = openLead;

  return (
    <>
      <Modal
        isOpen={detail !== null}
        onClose={closeDetail}
        variant="sidebar"
        size="lg"
        title={lead ? leadName(lead) : "Lead"}
        subtitle={
          lead ? (
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <Chip size="xs" variant={STATUS_META[lead.status].variant}>
                {STATUS_META[lead.status].label}
              </Chip>
              <Chip size="xs" variant="outline">
                {TYPE_LABEL[lead.type]}
              </Chip>
              {lead.company && (
                <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs">
                  {lead.company}
                </Typography>
              )}
            </div>
          ) : undefined
        }
      >
        {!lead ? (
          detail?.error ? (
            <Typography variant="p" textColor="var(--gy-danger)" className="text-sm">
              {detail.error}
            </Typography>
          ) : (
            <div className="space-y-3">
              <Skeleton height="120px" className="rounded-xl" />
              <Skeleton height="96px" className="rounded-xl" />
              <Skeleton height="200px" className="rounded-xl" />
            </div>
          )
        ) : (
          <div className="space-y-5">
            {permissions.canWork && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Mail className="size-3.5" />}
                  onClick={() => setDialog("email")}
                >
                  Send email
                </Button>
                {lead.type !== "WAITLIST" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<FileText className="size-3.5" />}
                    onClick={() => setDialog("quote")}
                    disabled={state.plans.length === 0}
                  >
                    Create quote
                  </Button>
                )}
                {permissions.canDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-[var(--gy-danger)]"
                    leftIcon={<Trash2 className="size-3.5" />}
                    onClick={() => setDialog("delete")}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}

            <LeadContactCard lead={lead} />

            <Section title="Deal">
              {/* Keyed on updatedAt so typed drafts reset after each save */}
              <LeadDealPanel key={`${lead.id}:${lead.updatedAt}`} lead={lead} />
            </Section>

            {lead.type !== "WAITLIST" && (
              <Section title={`Quotes (${lead.quoteCount})`}>
                <LeadQuotesList quotes={lead.quotes} />
              </Section>
            )}

            {permissions.canWork && (
              <Section title="Log activity">
                <LogActivityForm />
              </Section>
            )}

            <Section title="Timeline" aside={<TimelinePager />}>
              <LeadTimeline />
            </Section>
          </div>
        )}
      </Modal>

      {lead && state.dialog === "email" && <LeadEmailModal lead={lead} />}
      {lead && state.dialog === "quote" && <LeadQuoteModal lead={lead} />}
      {lead && state.dialog === "delete" && (
        <Modal
          isOpen
          onClose={state.saving ? undefined : () => setDialog(null)}
          size="sm"
          icon={<Trash2 className="size-4" />}
          title="Delete this lead?"
          subtitle={`${lead.email} and its timeline and quotes will be removed permanently.`}
          preventBackdropClose={state.saving}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDialog(null)} disabled={state.saving}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" isLoading={state.saving} onClick={() => void deleteLead()}>
                Delete lead
              </Button>
            </div>
          }
        />
      )}
    </>
  );
};
