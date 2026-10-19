"use client";

import { useMemo } from "react";
import { Chip, Dropdown, Input, Typography } from "@galyan/ui";
import { Search } from "lucide-react";
import { useLeadsContext } from "@/features/leads/context";
import { TYPE_LABEL, UNASSIGNED, VIEW_OPTIONS } from "@/features/leads/common/constants";
import type { LeadType, PipelineView } from "@/features/leads/types";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All types" },
  ...(["CONTACT", "DEMO", "ENTERPRISE"] as LeadType[]).map((t) => ({
    value: t,
    label: TYPE_LABEL[t],
  })),
];

/** Pipeline views + search + type / owner filters. */
export const LeadsToolbar = () => {
  const { state, setFilters, setSearchInput } = useLeadsContext();
  const { filters, summary } = state;

  const assigneeOptions = useMemo(
    () => [
      { value: "ALL", label: "Any owner" },
      { value: UNASSIGNED, label: "Unassigned" },
      ...state.assignees.map((a) => ({ value: a.id, label: a.fullName })),
    ],
    [state.assignees],
  );

  /** Count shown on a view chip, when the summary has it. */
  const countFor = (view: PipelineView): number | null => {
    if (!summary) return null;
    if (view === "OPEN") return summary.pipeline.open;
    if (view === "FOLLOW_UP_DUE") return summary.followUps.dueToday + summary.followUps.overdue;
    if (view === "ALL") return null;
    return summary.byStatus[view] ?? null;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Pipeline view">
        {VIEW_OPTIONS.map((v) => {
          const selected = filters.view === v.id;
          const count = countFor(v.id);
          return (
            <Chip
              key={v.id}
              size="sm"
              clickable
              selected={selected}
              variant={selected ? "solid" : "outline"}
              onClick={() => setFilters({ view: v.id })}
            >
              {v.label}
              {count !== null && (
                <Typography variant="small" as="span" className="ml-1 opacity-75 tabular-nums text-xs">
                  {count}
                </Typography>
              )}
            </Chip>
          );
        })}
      </div>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-[1fr_160px_160px] lg:grid-cols-[1fr_180px_180px]">
        <Input
          size="sm"
          placeholder="Search name, email, company or phone"
          value={state.searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftIcon={<Search className="size-3.5" />}
          aria-label="Search leads"
          className="w-full"
        />
        <Dropdown
          size="sm"
          options={TYPE_OPTIONS}
          value={filters.type}
          onChange={(v) => setFilters({ type: v as LeadType | "ALL" })}
        />
        <Dropdown
          size="sm"
          options={assigneeOptions}
          value={filters.assignee}
          onChange={(v) => setFilters({ assignee: String(v) })}
          searchable={state.assignees.length > 8}
        />
      </div>
    </div>
  );
};
