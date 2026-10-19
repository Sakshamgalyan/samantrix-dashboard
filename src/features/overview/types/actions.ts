import type { TeamMember } from "@/features/overview/types/api";

export type OverviewAction =
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_SELECTED_MEMBER"; payload: TeamMember | null };
