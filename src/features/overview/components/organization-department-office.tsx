"use client";

import React from "react";
import { Card, CardHeader, CardBody, Chip, BarChart, Typography, type BarChartItem } from "@galyan/ui";
import { DEFAULT_OFFICE_ZONES } from "@/features/overview/common/constants";

export type DepartmentItem = BarChartItem;

export interface OrganizationDepartmentOfficeProps {
  departmentData: DepartmentItem[];
  activeMembers: number;
  onlineCount: number;
}

export function OrganizationDepartmentOffice({
  departmentData,
  activeMembers,
  onlineCount,
}: OrganizationDepartmentOfficeProps) {
  const zones = [
    {
      ...DEFAULT_OFFICE_ZONES[0],
      chip: `${Math.max(onlineCount, 3)} active`,
    },
    DEFAULT_OFFICE_ZONES[1],
    DEFAULT_OFFICE_ZONES[2],
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
      <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs lg:col-span-2">
        <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography variant="h4" weight="semibold" textColor="var(--gy-text)" className="text-base tracking-tight">
                Department headcount
              </Typography>
              <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm">
                Seat allocation by functional unit
              </Typography>
            </div>
            <div className="self-start sm:self-auto rounded-full bg-[var(--gy-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--gy-primary)]">
              {activeMembers} active accounts
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0 pt-4 overflow-hidden">
          <div className="h-[260px] sm:h-[280px] w-full">
            <BarChart variant="filled" data={departmentData} height={250} showValues={true} />
          </div>
        </CardBody>
      </Card>

      <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs">
        <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
          <div className="flex w-full items-center justify-between">
            <Typography variant="h4" weight="semibold" textColor="var(--gy-text)" className="text-base tracking-tight">
              Office zone status
            </Typography>
            <Chip variant="soft" size="sm">
              Virtual space
            </Chip>
          </div>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm">
            Floor capacity &amp; meeting hubs
          </Typography>
        </CardHeader>
        <CardBody className="p-0 pt-4">
          <div className="space-y-2.5">
            {zones.map((zone) => (
              <div
                key={zone.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--gy-border)] bg-[var(--gy-surface-sunken)] p-3 transition-colors hover:border-[var(--gy-border-strong)]"
              >
                <div className="min-w-0 flex-1">
                  <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="block text-sm truncate">
                    {zone.name}
                  </Typography>
                  <Typography variant="small" textColor="var(--gy-text-subtle)" className="block text-xs truncate">
                    {zone.detail}
                  </Typography>
                </div>
                <Chip variant={zone.variant} size="sm" className="shrink-0">
                  {zone.chip}
                </Chip>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
