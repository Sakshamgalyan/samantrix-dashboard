"use client";

import { useMemo, useState } from "react";
import { Button, Dropdown, Input } from "@galyan/ui";
import { useLeadsContext } from "@/features/leads/context";
import {
  PIPELINE_STATUSES,
  STATUS_META,
  formatInr,
  fromDateInput,
  toDateInput,
} from "@/features/leads/common/constants";
import type { LeadDetail, LeadStatus } from "@/features/leads/types";

/** Status, owner, deal value and next follow-up. Read-only without "leads:work". */
export const LeadDealPanel = ({ lead }: { lead: LeadDetail }) => {
  const { state, permissions, updateLead } = useLeadsContext();
  const disabled = !permissions.canWork || state.saving;

  // Local drafts for the two typed fields; saved on demand
  const [value, setValue] = useState(lead.estimatedValue?.toString() ?? "");
  const [followUp, setFollowUp] = useState(toDateInput(lead.nextFollowUpAt));

  const statusOptions = useMemo(() => {
    const list =
      lead.type === "WAITLIST"
        ? (["CONFIRMED", "CONTACTED", "WON", "ARCHIVED"] as LeadStatus[])
        : PIPELINE_STATUSES;
    const all = list.includes(lead.status) ? list : [lead.status, ...list];
    return all.map((s) => ({ value: s, label: STATUS_META[s].label }));
  }, [lead.type, lead.status]);

  const ownerOptions = useMemo(() => [
    { value: "", label: "Unassigned" },
    ...state.assignees.map((a) => ({ value: a.id, label: a.fullName })),
  ], [state.assignees]);

  const valueChanged = value.trim() !== (lead.estimatedValue?.toString() ?? "");
  const followUpChanged = followUp !== toDateInput(lead.nextFollowUpAt);
  const parsedValue = value.trim() === "" ? null : Number(value);
  const valueInvalid = parsedValue !== null && (!Number.isFinite(parsedValue) || parsedValue < 0);

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
      <Dropdown
        label="Status"
        size="sm"
        options={statusOptions}
        value={lead.status}
        disabled={disabled}
        onChange={(s) => {
          if (s !== lead.status)
            void updateLead({ status: s as LeadStatus }, `Moved to ${STATUS_META[s as LeadStatus].label}.`);
        }}
      />
      <Dropdown
        label="Owner"
        size="sm"
        options={ownerOptions}
        value={lead.assignedToId ?? ""}
        disabled={disabled}
        searchable={state.assignees.length > 8}
        onChange={(id) => {
          const next = id ? String(id) : null;
          if (next !== lead.assignedToId)
            void updateLead({ assignedToId: next }, next ? "Owner assigned." : "Owner removed.");
        }}
      />
      <div className="flex items-end gap-2">
        <Input
          label="Estimated value (INR)"
          size="sm"
          type="number"
          min={0}
          placeholder="e.g. 150000"
          value={value}
          disabled={disabled}
          hasError={valueInvalid}
          helperText={
            valueInvalid ? "Enter a positive amount" : lead.estimatedValue !== null ? formatInr(lead.estimatedValue) : undefined
          }
          onChange={(e) => setValue(e.target.value)}
        />
        {valueChanged && !valueInvalid && (
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={() => void updateLead({ estimatedValue: parsedValue }, "Deal value saved.")}
          >
            Save
          </Button>
        )}
      </div>
      <div className="flex items-end gap-2">
        <Input
          label="Next follow-up"
          size="sm"
          type="date"
          value={followUp}
          disabled={disabled}
          onChange={(e) => setFollowUp(e.target.value)}
        />
        {followUpChanged && (
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={() =>
              void updateLead(
                { nextFollowUpAt: fromDateInput(followUp) },
                followUp ? "Follow-up scheduled." : "Follow-up cleared.",
              )
            }
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
};
