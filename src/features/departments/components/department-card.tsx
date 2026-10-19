"use client";

import React from "react";
import { Avatar, Card, Chip, Typography } from "@galyan/ui";
import { Crown, ArrowRight, Check } from "lucide-react";
import type { OrgDepartmentItem } from "../types/api";
import { getDepartmentMeta } from "../common/constants";

export interface DepartmentCardProps {
  department: OrgDepartmentItem;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

export function DepartmentCard({
  department,
  isSelected,
  onSelect,
}: DepartmentCardProps) {
  const meta = getDepartmentMeta(department.name);
  const IconComp = meta.icon;

  const previewMembers = department.members.slice(0, 4);
  const remainingCount = department.members.length - previewMembers.length;

  return (
    <Card
      variant="elevated"
      radius="xl"
      padding="md"
      className={`group relative flex flex-col justify-between cursor-pointer transition-all duration-200 border bg-[var(--gy-surface)] shadow-xs hover:shadow-md hover:border-[var(--gy-border-strong)] ${
        isSelected
          ? "border-[var(--gy-primary)] ring-2 ring-[var(--gy-primary)]/40 bg-[var(--gy-primary)]/[0.03]"
          : "border-[var(--gy-border)]"
      }`}
      onClick={() => onSelect(department.name)}
    >
      <div className="space-y-3">
        {/* Top Header: Badge + Headcount */}
        <div className="flex items-center justify-between gap-2">
          <Chip
            size="xs"
            variant={meta.badgeVariant}
            icon={<IconComp className="size-2.5" />}
          >
            {meta.name}
          </Chip>

          <Chip variant="neutral" size="xs">
            {department.memberCount} {department.memberCount === 1 ? "seat" : "seats"}
          </Chip>
        </div>

        {/* Department Name & Summary */}
        <div className="space-y-1">
          <Typography
            variant="h4"
            weight="semibold"
            textColor="var(--gy-text)"
            className="text-base tracking-tight truncate"
          >
            {department.name}
          </Typography>
          <Typography
            variant="small"
            textColor="var(--gy-text-secondary)"
            className="text-xs line-clamp-2 leading-relaxed"
          >
            {meta.description}
          </Typography>
        </div>

        {/* Department Lead Block */}
        <div className="rounded-xl border border-[var(--gy-border)]/70 bg-[var(--gy-surface-subtle)] p-2.5">
          <div className="flex items-center justify-between text-xs text-[var(--gy-text-subtle)] mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Crown className="size-3 text-amber-500 shrink-0" />
              <Typography
                variant="span"
                weight="medium"
                textColor="var(--gy-text-subtle)"
                className="text-[11px] uppercase tracking-wider"
              >
                Department Lead
              </Typography>
            </span>
          </div>

          {department.lead ? (
            <div className="flex items-center gap-2.5">
              <Avatar
                size="xs"
                name={department.lead.fullName}
                src={department.lead.avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <Typography
                  variant="small"
                  weight="semibold"
                  textColor="var(--gy-text)"
                  className="text-xs truncate block"
                >
                  {department.lead.fullName}
                </Typography>
                <Typography
                  variant="small"
                  textColor="var(--gy-text-subtle)"
                  className="text-[11px] truncate block"
                >
                  {department.lead.jobTitle || department.lead.email}
                </Typography>
              </div>
            </div>
          ) : (
            <Typography
              variant="small"
              textColor="var(--gy-text-subtle)"
              className="text-xs italic block py-0.5"
            >
              No lead appointed
            </Typography>
          )}
        </div>
      </div>

      {/* Member Avatar Preview Stack & Selection CTA */}
      <div className="mt-3.5 flex items-center justify-between border-t border-[var(--gy-border)] pt-2.5">
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {previewMembers.map((m) => (
            <Avatar
              key={m.id}
              size="xs"
              name={m.fullName}
              src={m.avatarUrl}
              className="ring-2 ring-[var(--gy-surface)]"
            />
          ))}
          {remainingCount > 0 && (
            <div className="flex size-5.5 items-center justify-center rounded-full bg-[var(--gy-surface-sunken)] ring-2 ring-[var(--gy-surface)] text-[9px] font-bold text-[var(--gy-text-subtle)]">
              +{remainingCount}
            </div>
          )}
          {department.members.length === 0 && (
            <Typography
              variant="small"
              textColor="var(--gy-text-subtle)"
              className="text-xs italic"
            >
              0 members
            </Typography>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isSelected ? (
            <Chip variant="primary" size="xs" icon={<Check className="size-2.5" />}>
              Active View
            </Chip>
          ) : (
            <div className="flex items-center gap-1 text-xs font-medium text-[var(--gy-primary)] group-hover:translate-x-0.5 transition-transform">
              <Typography
                variant="span"
                weight="medium"
                textColor="var(--gy-primary)"
                className="text-xs"
              >
                Roster
              </Typography>
              <ArrowRight className="size-3" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
