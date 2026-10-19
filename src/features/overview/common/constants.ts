import type { ChipVariant } from "@galyan/ui";

export interface OfficeZone {
  name: string;
  detail: string;
  chip: string;
  variant: ChipVariant;
}

export const DEFAULT_OFFICE_ZONES: OfficeZone[] = [
  {
    name: "Main open office area",
    detail: "Desks 1-16 & lounge",
    chip: "active",
    variant: "success",
  },
  {
    name: "Executive conference A",
    detail: "LiveKit audio/video hub",
    chip: "2 in huddle",
    variant: "soft",
  },
  {
    name: "Engineering war room",
    detail: "Screen share & pairing",
    chip: "Busy",
    variant: "warning",
  },
];

export const WEEKLY_ATTENDANCE_MOCK = [
  { day: "Mon", attendance: 8, meetings: 14 },
  { day: "Tue", attendance: 11, meetings: 18 },
  { day: "Wed", attendance: 12, meetings: 22 },
  { day: "Thu", attendance: 10, meetings: 19 },
  { day: "Fri", attendance: 9, meetings: 12 },
  { day: "Sat", attendance: 3, meetings: 2 },
  { day: "Sun", attendance: 2, meetings: 1 },
];

export const DEPARTMENT_DATA_MOCK = [
  { label: "Engineering", value: 6, color: "var(--gy-primary)" },
  { label: "Product & Design", value: 3, color: "var(--gy-info)" },
  { label: "Operations", value: 2, color: "var(--gy-warning)" },
  { label: "Executive / Strategy", value: 1, color: "var(--gy-success)" },
];

export const KPI_LABEL = "text-xs font-medium text-[var(--gy-text-secondary)]";
export const KPI_CAPTION = "mt-2 text-xs text-[var(--gy-text-subtle)]";
export const ICON_TILE = "grid size-9 place-items-center rounded-xl";
