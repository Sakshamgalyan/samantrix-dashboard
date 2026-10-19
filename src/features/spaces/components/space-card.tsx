"use client";

import React from "react";
import {
  Button,
  Card,
  Chip,
  ProgressBar,
  Typography,
} from "@galyan/ui";
import {
  Edit2,
  Lock,
  Trash2,
  Users2,
  Sparkles,
} from "lucide-react";
import type { OrgRoomItem } from "../types/api";
import { ROOM_TYPE_META } from "../common/constants";

export interface SpaceCardProps {
  room: OrgRoomItem;
  canEdit: boolean;
  onEdit: (room: OrgRoomItem) => void;
  onDelete: (room: OrgRoomItem) => void;
}

export function SpaceCard({
  room,
  canEdit,
  onEdit,
  onDelete,
}: SpaceCardProps) {
  const meta = ROOM_TYPE_META[room.type] || ROOM_TYPE_META.OPEN_WORKSPACE;
  const IconComp = meta.icon;

  const occupancyRatio =
    room.capacity > 0 ? (room.occupantCount / room.capacity) * 100 : 0;
  const isCrowded = occupancyRatio >= 85;

  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className="group relative flex flex-col justify-between transition-all duration-200 border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs hover:border-[var(--gy-border-strong)] hover:shadow-md"
    >
      <div className="space-y-3">
        {/* Top Header: Room Type Chip + Badges + Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip
              size="xs"
              variant={meta.badgeVariant}
              icon={<IconComp className="size-2.5" />}
            >
              {meta.label}
            </Chip>

            {room.isPrivate && (
              <Chip
                size="xs"
                variant="warning"
                icon={<Lock className="size-2.5" />}
              >
                Private
              </Chip>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="xs"
                className="h-7 w-7 p-0 text-[var(--gy-text-subtle)] hover:text-[var(--gy-text)] hover:bg-[var(--gy-surface-hover)] rounded-lg"
                onClick={() => onEdit(room)}
                aria-label={`Edit ${room.name}`}
              >
                <Edit2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="h-7 w-7 p-0 text-[var(--gy-text-subtle)] hover:text-[var(--gy-danger)] hover:bg-[var(--gy-danger-soft,#fef2f2)] rounded-lg"
                onClick={() => onDelete(room)}
                aria-label={`Delete ${room.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Room Name & Description */}
        <div className="space-y-1">
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text)"
            className="text-base tracking-tight truncate"
          >
            {room.name}
          </Typography>
          <Typography
            variant="small"
            textColor="var(--gy-text-secondary)"
            className="text-xs line-clamp-2 leading-relaxed"
          >
            {meta.description}
          </Typography>
        </div>

        {/* Real-time Occupancy Metric */}
        <div className="space-y-1.5 rounded-xl border border-[var(--gy-border)]/70 bg-[var(--gy-surface-subtle)] p-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full ${
                  room.occupantCount > 0
                    ? isCrowded
                      ? "bg-amber-400 animate-pulse"
                      : "bg-emerald-400"
                    : "bg-neutral-400"
                }`}
              />
              <Typography
                variant="span"
                weight="medium"
                textColor="var(--gy-text-subtle)"
                className="text-[11px] uppercase tracking-wider"
              >
                Live Occupancy
              </Typography>
            </div>
            <Typography
              variant="span"
              weight="semibold"
              textColor="var(--gy-text)"
              className="text-xs font-mono"
            >
              {room.occupantCount} / {room.capacity} seats
            </Typography>
          </div>

          <ProgressBar
            progress={Math.min(occupancyRatio, 100)}
            size="sm"
            variant={isCrowded ? "warning" : "primary"}
            className="h-1.5 rounded-full"
            showLabel={false}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3.5 flex items-center justify-between border-t border-[var(--gy-border)] pt-2.5">
        <div className="flex items-center gap-1.5">
          <Users2 className="size-3.5 text-[var(--gy-text-subtle)]" />
          <Typography
            variant="small"
            textColor="var(--gy-text-subtle)"
            className="text-xs"
          >
            Max {room.capacity} persons
          </Typography>
        </div>
        <Chip
          size="xs"
          variant={room.isPrivate ? "warning" : "neutral"}
        >
          {room.isPrivate ? "Restricted Access" : "Open Zone"}
        </Chip>
      </div>
    </Card>
  );
}
