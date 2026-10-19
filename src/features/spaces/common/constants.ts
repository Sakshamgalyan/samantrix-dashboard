import type React from "react";
import {
  DoorOpen,
  LayoutGrid,
  Video,
  Presentation,
  Coffee,
  Headphones,
  Briefcase,
  Utensils,
  Boxes,
  type LucideIcon,
} from "lucide-react";
import type { RoomType } from "../types/api";

export interface RoomTypeMeta {
  type: RoomType;
  label: string;
  description: string;
  icon: LucideIcon;
  badgeVariant: "primary" | "success" | "warning" | "neutral" | "danger";
  defaultCapacity: number;
}

export const ROOM_TYPE_META: Record<RoomType, RoomTypeMeta> = {
  LOBBY: {
    type: "LOBBY",
    label: "Main Lobby",
    description: "Central arrival area for visitors and team check-ins.",
    icon: DoorOpen,
    badgeVariant: "primary",
    defaultCapacity: 50,
  },
  OPEN_WORKSPACE: {
    type: "OPEN_WORKSPACE",
    label: "Open Workspace",
    description: "Collaborative desk floor with proximity voice and avatars.",
    icon: LayoutGrid,
    badgeVariant: "neutral",
    defaultCapacity: 30,
  },
  MEETING: {
    type: "MEETING",
    label: "Meeting Room",
    description: "Synchronous huddle space with screenshare and video.",
    icon: Video,
    badgeVariant: "success",
    defaultCapacity: 10,
  },
  CONFERENCE: {
    type: "CONFERENCE",
    label: "Conference Hall",
    description: "Large presentation zone for all-hands and company demos.",
    icon: Presentation,
    badgeVariant: "warning",
    defaultCapacity: 100,
  },
  BREAK_ROOM: {
    type: "BREAK_ROOM",
    label: "Break Room",
    description: "Casual watercooler hangout zone with spatial audio.",
    icon: Coffee,
    badgeVariant: "neutral",
    defaultCapacity: 20,
  },
  FOCUS_ROOM: {
    type: "FOCUS_ROOM",
    label: "Focus Pod",
    description: "Quiet zone for deep concentration without incoming pings.",
    icon: Headphones,
    badgeVariant: "primary",
    defaultCapacity: 4,
  },
  CABIN: {
    type: "CABIN",
    label: "Executive Cabin",
    description: "Private office suite restricted to authorized leaders.",
    icon: Briefcase,
    badgeVariant: "warning",
    defaultCapacity: 6,
  },
  CAFETERIA: {
    type: "CAFETERIA",
    label: "Cafeteria & Lounge",
    description: "Social and casual interaction space for company events.",
    icon: Utensils,
    badgeVariant: "neutral",
    defaultCapacity: 40,
  },
};

export const ROOM_TYPE_OPTIONS: Array<{ value: RoomType; label: string }> = [
  { value: "OPEN_WORKSPACE", label: "Open Workspace" },
  { value: "MEETING", label: "Meeting Room" },
  { value: "CONFERENCE", label: "Conference Hall" },
  { value: "FOCUS_ROOM", label: "Focus Pod" },
  { value: "CABIN", label: "Executive Cabin" },
  { value: "BREAK_ROOM", label: "Break Room" },
  { value: "CAFETERIA", label: "Cafeteria & Lounge" },
  { value: "LOBBY", label: "Main Lobby" },
];

export const FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "All Spaces" },
  { value: "MEETING", label: "Meetings" },
  { value: "OPEN_WORKSPACE", label: "Open Desks" },
  { value: "FOCUS_ROOM", label: "Focus Pods" },
  { value: "CABIN", label: "Cabins" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "BREAK_ROOM", label: "Break / Lounge" },
];

export interface OfficeThemeOption {
  key: string;
  name: string;
  description: string;
  badge: string;
  accentColor: string;
}

export const OFFICE_THEMES: OfficeThemeOption[] = [
  {
    key: "default_office_map",
    name: "Corporate Blue Tech",
    description: "Sleek glass partitions, polished navy terrazzo, and executive blue glow.",
    badge: "Corporate",
    accentColor: "#3b82f6",
  },
  {
    key: "cyberpunk_neon",
    name: "Cyberpunk Neon Synth",
    description: "High-contrast dark synthwave with purple edge lighting and holographic grid.",
    badge: "High-Tech",
    accentColor: "#a855f7",
  },
  {
    key: "scandinavian_wood",
    name: "Scandinavian Timber",
    description: "Warm cedar wood slats, natural daylighting, and indoor living greenery.",
    badge: "Eco-Modern",
    accentColor: "#10b981",
  },
  {
    key: "minimalist_loft",
    name: "Industrial Minimalist",
    description: "Polished concrete floor, matte black structural columns, and warm brass accents.",
    badge: "Loft Studio",
    accentColor: "#f59e0b",
  },
  {
    key: "futuristic_glass",
    name: "Crystalline Atrium",
    description: "Panoramic floating glass panels, sky reflections, and serene acoustic ambient.",
    badge: "Next-Gen",
    accentColor: "#06b6d4",
  },
];

export const AMBIENT_SOUND_OPTIONS = [
  { value: "none", label: "Silent (No background audio)" },
  { value: "lofi_work", label: "Lo-Fi Deep Focus Chill" },
  { value: "coffee_shop", label: "Downtown Coffee Lounge" },
  { value: "gentle_rain", label: "Gentle Rain on Skylight" },
  { value: "subtle_cyber", label: "Subtle Datacenter Hum" },
];
