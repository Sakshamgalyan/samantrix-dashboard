"use client";

import React from "react";
import {
  Button,
  Card,
  Chip,
  Toggle,
  Typography,
} from "@galyan/ui";
import {
  Cpu,
  Edit2,
  Radio,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { OrgAiAssistant } from "../types/api";
import { getArchetypeMeta } from "../common/constants";

export interface AssistantCardProps {
  assistant: OrgAiAssistant;
  canEdit: boolean;
  isToggling: boolean;
  onToggle: (id: string, nextChecked: boolean) => void;
  onEdit: (assistant: OrgAiAssistant) => void;
  onDelete: (assistant: OrgAiAssistant) => void;
}

export function AssistantCard({
  assistant,
  canEdit,
  isToggling,
  onToggle,
  onEdit,
  onDelete,
}: AssistantCardProps) {
  const meta = getArchetypeMeta(assistant.archetype);
  const IconComp = meta.icon;

  const isCustom =
    assistant.id.startsWith("ai-") &&
    !["ai-scribe", "ai-concierge", "ai-standup", "ai-knowledge"].includes(
      assistant.id,
    );

  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="group relative flex flex-col justify-between transition-all duration-200 border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] hover:shadow-md"
    >
      <div className="space-y-3">
        {/* Top Header: Archetype Badge + Model + Quick Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip
              size="xs"
              variant={meta.badgeVariant}
              icon={<IconComp className="size-2.5" />}
            >
              {meta.label}
            </Chip>

            <Chip size="xs" variant="neutral" icon={<Cpu className="size-2.5" />}>
              {assistant.model.replace("simantrix-", "").slice(0, 16)}
            </Chip>
          </div>

          <div className="flex items-center gap-2">
            <Toggle
              size="sm"
              checked={assistant.isEnabled}
              isDisabled={!canEdit || isToggling}
              onChange={(e) => onToggle(assistant.id, e.target.checked)}
              aria-label={`Toggle ${assistant.name}`}
            />
          </div>
        </div>

        {/* Assistant Name & Description */}
        <div className="space-y-1">
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text)"
            className="text-base tracking-tight truncate"
          >
            {assistant.name}
          </Typography>
          <Typography
            variant="small"
            textColor="var(--gy-text-secondary)"
            className="text-xs line-clamp-2 leading-relaxed"
          >
            {assistant.description || "Autonomous AI bot configured for your workplace."}
          </Typography>
        </div>

        {/* Prompt Preview Snippet */}
        <div className="rounded-xl border border-[var(--gy-border)]/70 bg-[var(--gy-surface-subtle)] p-2.5 font-mono text-[11px] text-[var(--gy-text-subtle)] line-clamp-2">
          <Typography
            variant="span"
            weight="semibold"
            textColor="var(--gy-text)"
            className="text-[11px] font-mono mr-1"
          >
            Prompt:
          </Typography>
          {assistant.systemPrompt}
        </div>

        {/* Status Callouts */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {assistant.autoJoinMeetings && (
            <Chip size="xs" variant="primary" icon={<Radio className="size-2.5" />}>
              Auto-joins meetings
            </Chip>
          )}
          {assistant.assignedRoomIds && assistant.assignedRoomIds.length > 0 ? (
            <Chip size="xs" variant="success" icon={<Sparkles className="size-2.5" />}>
              Stationed in {assistant.assignedRoomIds.length}{" "}
              {assistant.assignedRoomIds.length === 1 ? "room" : "rooms"}
            </Chip>
          ) : (
            <Chip size="xs" variant="neutral">
              Workspace-wide
            </Chip>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-3.5 flex items-center justify-between border-t border-[var(--gy-border)] pt-2.5 text-xs text-[var(--gy-text-subtle)]">
        <div className="flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full ${
              assistant.isEnabled ? "bg-emerald-400" : "bg-neutral-400"
            }`}
          />
          <Typography
            variant="small"
            textColor="var(--gy-text-subtle)"
            className="text-xs"
          >
            {assistant.isEnabled ? "Active in Preview" : "Disabled"}
          </Typography>
        </div>

        {canEdit && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="xs"
              className="h-7 w-7 p-0 text-[var(--gy-text-subtle)] hover:text-[var(--gy-text)] hover:bg-[var(--gy-surface-hover)] rounded-lg"
              onClick={() => onEdit(assistant)}
              aria-label={`Configure ${assistant.name}`}
            >
              <Edit2 className="size-3.5" />
            </Button>
            {isCustom && (
              <Button
                variant="ghost"
                size="xs"
                className="h-7 w-7 p-0 text-[var(--gy-text-subtle)] hover:text-[var(--gy-danger)] hover:bg-[var(--gy-danger-soft,#fef2f2)] rounded-lg"
                onClick={() => onDelete(assistant)}
                aria-label={`Delete ${assistant.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
