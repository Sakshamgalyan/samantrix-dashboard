import type { TeamMember } from "@/features/overview/types/api";

export interface OverviewState {
  searchTerm: string;
  page: number;
  selectedMember: TeamMember | null;
}
