"use client";

import React from "react";
import { Card, CardHeader, CardBody, Chip, AreaChart, DonutChart, Typography } from "@galyan/ui";

export interface PresenceBreakdownItem {
  name: string;
  value: number;
  color: string;
  dot: string;
}

export interface AttendanceItem {
  day: string;
  attendance: number;
  meetings: number;
}

export interface OrganizationCollaborationChartsProps {
  weeklyAttendanceData: AttendanceItem[];
  presenceBreakdown: PresenceBreakdownItem[];
}

export function OrganizationCollaborationCharts({
  weeklyAttendanceData,
  presenceBreakdown,
}: OrganizationCollaborationChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
      <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs lg:col-span-2">
        <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography variant="h4" weight="semibold" textColor="var(--gy-text)" className="text-base tracking-tight">
                Weekly attendance &amp; collaboration
              </Typography>
              <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm">
                Daily presence in the virtual office and collaborative meeting hours
              </Typography>
            </div>
            <Chip variant="soft" size="sm" className="self-start sm:self-auto shrink-0">
              Last 7 days
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="p-0 pt-4 overflow-hidden">
          <div className="h-[280px] sm:h-[320px] w-full">
            <AreaChart
              data={weeklyAttendanceData}
              xAxisKey="day"
              height={280}
              series={[
                { key: "attendance", name: "Active teammates", color: "var(--gy-info)" },
                { key: "meetings", name: "Meeting hours", color: "var(--gy-primary)" },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <Card variant="elevated" radius="lg" padding="md" className="border border-[var(--gy-border)] bg-[var(--gy-surface)] shadow-xs">
        <CardHeader className="border-b border-[var(--gy-border)] p-0 pb-3.5">
          <Typography variant="h4" weight="semibold" textColor="var(--gy-text)" className="text-base tracking-tight">
            Live presence breakdown
          </Typography>
          <Typography variant="small" textColor="var(--gy-text-secondary)" className="text-xs sm:text-sm">
            Current teammate availability
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col items-center justify-center p-0 pt-4">
          <div className="flex h-[220px] sm:h-[240px] w-full items-center justify-center">
            <DonutChart
              data={presenceBreakdown.map(({ name, value, color }) => ({ name, value, color }))}
              height={210}
              variant="standard"
              showLegend={true}
            />
          </div>
          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-xs">
            {presenceBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-[var(--gy-text-secondary)] min-w-0">
                <span className={`size-2 shrink-0 rounded-full ${item.dot}`} />
                <Typography variant="small" textColor="var(--gy-text-secondary)" className="truncate text-xs">
                  {item.name}: <Typography variant="span" weight="semibold" textColor="var(--gy-text)">{item.value}</Typography>
                </Typography>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
