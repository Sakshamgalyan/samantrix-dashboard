"use client";

import { Skeleton } from "@galyan/ui";
import { CalendarClock, FileText, PhoneCall, Sparkles, Trophy } from "lucide-react";
import { KpiCard } from "@/components/layout/common/kpi-card";
import { useLeadsContext } from "@/features/leads/context";
import { formatInr } from "@/features/leads/common/constants";

/** New this week · contacted rate · quotes · won value · follow-ups. */
export const LeadsKpis = () => {
  const { state, setTab, setFilters } = useLeadsContext();
  const s = state.summary;

  if (!s) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} height="88px" className="rounded-xl" />
        ))}
      </div>
    );
  }

  const weekDelta = s.newLast7d;
  const response =
    s.avgFirstResponseHours === null
      ? "No responses logged yet"
      : `Avg first reply ${s.avgFirstResponseHours < 1 ? "< 1h" : `${Math.round(s.avgFirstResponseHours)}h`}`;
  const followUps = s.followUps.overdue + s.followUps.dueToday;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      <KpiCard
        label="New this week"
        icon={<Sparkles className="size-4" />}
        value={weekDelta}
        caption={`${s.newThisMonth} this month · ${s.pipeline.open} open`}
      />
      <KpiCard
        label="Contacted rate"
        icon={<PhoneCall className="size-4" />}
        tone="info"
        value={`${s.rates.contactedRate}%`}
        caption={response}
      />
      <KpiCard
        label="Quotes sent"
        icon={<FileText className="size-4" />}
        tone="warning"
        value={s.quotes.sent}
        caption={`${s.quotes.accepted} accepted · ${s.rates.quoteAcceptanceRate}%`}
      />
      <KpiCard
        label="Won value"
        icon={<Trophy className="size-4" />}
        tone="success"
        value={formatInr(s.value.won, s.value.currency)}
        caption={`${s.pipeline.won} won · ${s.rates.conversionRate}% conversion`}
      />
      <button
        type="button"
        className="w-full text-left transition-transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gy-primary)] rounded-lg cursor-pointer"
        onClick={() => {
          setTab("pipeline");
          setFilters({ view: "FOLLOW_UP_DUE" });
        }}
        aria-label="Show leads with a follow-up due"
      >
        <KpiCard
          label="Follow-ups due"
          icon={<CalendarClock className="size-4" />}
          tone={s.followUps.overdue > 0 ? "danger" : "primary"}
          value={followUps}
          caption={`${s.followUps.overdue} overdue · ${s.followUps.unassignedOpen} unassigned`}
        />
      </button>
    </div>
  );
};
