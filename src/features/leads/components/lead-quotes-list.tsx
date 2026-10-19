"use client";

import { Button, Chip, Menu, Typography, type MenuItem } from "@galyan/ui";
import { CheckCircle2, MoreHorizontal, Send, XCircle } from "lucide-react";
import { formatDate } from "@/utils/format";
import { GLASS_ROW } from "@/components/layout/common/glass";
import { useLeadsContext } from "@/features/leads/context";
import { PLAN_LABEL, QUOTE_STATUS_META, formatInr } from "@/features/leads/common/constants";
import type { LeadQuote } from "@/features/leads/types";

const QuoteRow = ({ quote }: { quote: LeadQuote }) => {
  const { state, permissions, sendQuote, setQuoteStatus } = useLeadsContext();
  const open = quote.status === "DRAFT" || quote.status === "SENT";
  const expired = open && new Date(quote.validUntil) < new Date();
  const meta = QUOTE_STATUS_META[expired ? "EXPIRED" : quote.status];

  const menu: MenuItem[] = [
    { id: "ACCEPTED", label: "Mark accepted", icon: <CheckCircle2 className="size-3.5" /> },
    { id: "REJECTED", label: "Mark rejected", icon: <XCircle className="size-3.5" /> },
  ];

  return (
    <div className={`${GLASS_ROW} p-3 rounded-xl border border-[var(--gy-border)]/50`}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Typography variant="small" weight="medium" textColor="var(--gy-text)">
              {quote.quoteNumber}
            </Typography>
            <Chip size="xs" variant={meta.variant}>
              {meta.label}
            </Chip>
          </div>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs block">
            {quote.planTier ? `${PLAN_LABEL[quote.planTier]} · ` : ""}
            {quote.seats} seat{quote.seats === 1 ? "" : "s"} · {quote.billingCycle.toLowerCase()} · valid until{" "}
            {formatDate(quote.validUntil)}
          </Typography>
        </div>
        <Typography variant="small" weight="semibold" textColor="var(--gy-text)">
          {formatInr(quote.total, quote.currency)}
        </Typography>
        {permissions.canWork && open && (
          <>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Send className="size-3" />}
              disabled={state.saving}
              onClick={() => void sendQuote(quote.id)}
            >
              {quote.status === "DRAFT" ? "Send" : "Resend"}
            </Button>
            <Menu
              items={menu}
              size="sm"
              variant="bordered"
              placement="bottom-end"
              width={170}
              onItemClick={(id) => void setQuoteStatus(quote.id, id as "ACCEPTED" | "REJECTED")}
              trigger={
                <Button
                  variant="ghost"
                  size="xs"
                  leftIcon={<MoreHorizontal className="size-4" />}
                  aria-label={`More actions for ${quote.quoteNumber}`}
                  disabled={state.saving}
                />
              }
            />
          </>
        )}
      </div>
      {quote.sentAt && (
        <Typography variant="small" textColor="var(--gy-text-subtle)" className="mt-1 text-xs block">
          Sent {formatDate(quote.sentAt)}
        </Typography>
      )}
    </div>
  );
};

export const LeadQuotesList = ({ quotes }: { quotes: LeadQuote[] }) => {
  if (quotes.length === 0) {
    return (
      <Typography variant="small" textColor="var(--gy-text-subtle)" className="text-xs">
        No quotes yet.
      </Typography>
    );
  }
  return (
    <div className="space-y-2">
      {quotes.map((q) => (
        <QuoteRow key={q.id} quote={q} />
      ))}
    </div>
  );
};
