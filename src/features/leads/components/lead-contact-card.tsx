"use client";

import type React from "react";
import { Button, Tooltip, Typography } from "@galyan/ui";
import { Building2, Check, Copy, Globe, Mail, Phone, Users } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatDateTime } from "@/utils/format";
import { GLASS_ROW } from "@/components/layout/common/glass";
import type { LeadDetail } from "@/features/leads/types";

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const { copied, copy } = useCopyToClipboard();
  return (
    <Tooltip content={copied ? "Copied" : `Copy ${label}`} size="sm" position="left">
      <Button
        variant="ghost"
        size="xs"
        aria-label={`Copy ${label}`}
        leftIcon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        onClick={() => void copy(value)}
      />
    </Tooltip>
  );
};

const Row = ({
  icon,
  children,
  copy,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  copy?: { value: string; label: string };
}) => {
  return (
    <div className="flex min-h-7 items-center gap-2 text-sm">
      <span className="shrink-0 text-[var(--gy-text-subtle)] [&_svg]:size-3.5">{icon}</span>
      <div className="min-w-0 flex-1 truncate">{children}</div>
      {copy && <CopyButton value={copy.value} label={copy.label} />}
    </div>
  );
};

/** How to reach the lead (mailto / tel links with copy) and what they told us. */
export const LeadContactCard = ({ lead }: { lead: LeadDetail }) => {
  const linkClass = "text-[var(--gy-primary)] hover:underline";
  return (
    <div className={`${GLASS_ROW} space-y-1.5 p-3.5 rounded-xl border border-[var(--gy-border)]/50`}>
      <Row icon={<Mail />} copy={{ value: lead.email, label: "email" }}>
        <a className={linkClass} href={`mailto:${lead.email}`}>
          <Typography variant="small" as="span" textColor="var(--gy-primary)" className="hover:underline">
            {lead.email}
          </Typography>
        </a>
      </Row>
      <Row icon={<Phone />} copy={lead.phone ? { value: lead.phone, label: "phone" } : undefined}>
        {lead.phone ? (
          <a className={linkClass} href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>
            <Typography variant="small" as="span" textColor="var(--gy-primary)" className="hover:underline">
              {lead.phone}
            </Typography>
          </a>
        ) : (
          <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
            No phone number
          </Typography>
        )}
      </Row>
      {(lead.company || lead.jobTitle) && (
        <Row icon={<Building2 />}>
          <Typography variant="small" textColor="var(--gy-text)">
            {[lead.jobTitle, lead.company].filter(Boolean).join(" at ")}
          </Typography>
        </Row>
      )}
      {lead.country && (
        <Row icon={<Globe />}>
          <Typography variant="small" textColor="var(--gy-text)">
            {lead.country}
          </Typography>
        </Row>
      )}
      {lead.teamSize && (
        <Row icon={<Users />}>
          <Typography variant="small" textColor="var(--gy-text-secondary)">
            Team {lead.teamSize}
          </Typography>
        </Row>
      )}

      {(lead.interest || lead.message) && (
        <div className="mt-2 border-t border-[var(--gy-border)]/50 pt-2 space-y-1">
          {lead.interest && (
            <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="block">
              {lead.interest}
            </Typography>
          )}
          {lead.message && (
            <Typography
              variant="small"
              textColor="var(--gy-text-secondary)"
              className="whitespace-pre-wrap block leading-relaxed text-xs"
            >
              {lead.message}
            </Typography>
          )}
        </div>
      )}
      <Typography variant="small" textColor="var(--gy-text-subtle)" className="pt-1 text-xs block">
        Received {formatDateTime(lead.createdAt)}
        {lead.source ? ` · ${lead.source}` : ""}
      </Typography>
    </div>
  );
};
