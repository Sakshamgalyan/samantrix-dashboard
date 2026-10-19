"use client";

import { useState } from "react";
import { Button, Chip, Skeleton, Textarea, Typography } from "@galyan/ui";
import {
  ArrowRightLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  MessageSquare,
  PhoneCall,
} from "lucide-react";
import { formatDateTime, relativeTime } from "@/utils/format";
import { useLeadsContext } from "@/features/leads/context";
import { ACTIVITY_LABEL } from "@/features/leads/common/constants";
import { leadActivitySchema, type LeadActivityType } from "@/features/leads/types";

const ICONS: Record<LeadActivityType, React.ReactNode> = {
  NOTE: <MessageSquare />,
  EMAIL: <Mail />,
  CALL: <PhoneCall />,
  MEETING: <CalendarDays />,
  QUOTE: <FileText />,
  STATUS_CHANGE: <ArrowRightLeft />,
};

const KINDS = [
  { id: "NOTE", label: "Note" },
  { id: "CALL", label: "Call" },
  { id: "MEETING", label: "Meeting" },
] as const;

/** Quick log: a note (internal) or a call / meeting (counts as contacting the lead). */
export const LogActivityForm = () => {
  const { state, logActivity } = useLeadsContext();
  const [type, setType] = useState<(typeof KINDS)[number]["id"]>("NOTE");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const parsed = leadActivitySchema.safeParse({ type, body });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the text");
      return;
    }
    setError(null);
    if (await logActivity(parsed.data)) setBody("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {KINDS.map((k) => (
          <Chip
            key={k.id}
            size="sm"
            clickable
            selected={type === k.id}
            variant={type === k.id ? "solid" : "outline"}
            onClick={() => setType(k.id)}
          >
            {k.label}
          </Chip>
        ))}
      </div>
      <Textarea
        size="sm"
        rows={3}
        placeholder={
          type === "NOTE"
            ? "Internal note — only your team sees this"
            : type === "CALL"
              ? "What was discussed on the call?"
              : "Meeting summary and next steps"
        }
        value={body}
        onChange={(e) => setBody(e.target.value)}
        hasError={Boolean(error)}
        helperText={error ?? undefined}
        maxCharCount={5000}
      />
      <div className="flex justify-end">
        <Button size="sm" variant="primary" isLoading={state.saving} onClick={() => void submit()}>
          {type === "NOTE" ? "Add note" : `Log ${type === "CALL" ? "call" : "meeting"}`}
        </Button>
      </div>
    </div>
  );
};

/** Newer / older buttons for the timeline (paged on the server, 10 entries per page). */
export const TimelinePager = () => {
  const { state, setTimelinePage } = useLeadsContext();
  const meta = state.timeline.meta;
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--gy-text-secondary)]">
      <Typography variant="small" textColor="var(--gy-text-secondary)" className="tabular-nums text-xs">
        {meta.page} / {meta.totalPages}
      </Typography>
      <Button
        variant="ghost"
        size="xs"
        aria-label="Newer activity"
        disabled={!meta.hasPreviousPage}
        onClick={() => setTimelinePage(meta.page - 1)}
      >
        <ChevronLeft className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="xs"
        aria-label="Older activity"
        disabled={!meta.hasNextPage}
        onClick={() => setTimelinePage(meta.page + 1)}
      >
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
};

/** Newest-first history of everything that happened to the open lead (one page). */
export const LeadTimeline = () => {
  const { state } = useLeadsContext();
  const { items: activities, loading, error } = state.timeline;
  if (error) {
    return (
      <Typography variant="small" textColor="var(--gy-danger)" className="py-4 text-center text-xs block">
        {error}
      </Typography>
    );
  }
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} height="36px" className="rounded-lg" />
        ))}
      </div>
    );
  }
  if (activities.length === 0) {
    return (
      <Typography variant="small" textColor="var(--gy-text-subtle)" className="py-4 text-center text-xs block">
        No activity yet.
      </Typography>
    );
  }
  return (
    <ol className="relative space-y-3 border-l border-[var(--gy-border)] pl-4">
      {activities.map((a) => (
        <li key={a.id} className="relative">
          <span className="absolute -left-[25px] grid size-[18px] place-items-center rounded-full bg-[var(--gy-surface)] text-[var(--gy-text-secondary)] ring-1 ring-[var(--gy-border)] [&_svg]:size-2.5">
            {ICONS[a.type]}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Typography variant="small" weight="medium" textColor="var(--gy-text)" className="text-xs">
              {a.subject || ACTIVITY_LABEL[a.type]}
            </Typography>
            <Typography
              variant="small"
              textColor="var(--gy-text-subtle)"
              className="text-xs tabular-nums"
              title={formatDateTime(a.createdAt)}
            >
              {a.actor?.fullName ? `${a.actor.fullName} · ` : ""}
              {relativeTime(a.createdAt)}
            </Typography>
          </div>
          {a.body && (
            <Typography
              variant="small"
              textColor="var(--gy-text-secondary)"
              className="mt-0.5 line-clamp-6 whitespace-pre-wrap text-xs leading-relaxed block"
            >
              {a.body}
            </Typography>
          )}
        </li>
      ))}
    </ol>
  );
};
