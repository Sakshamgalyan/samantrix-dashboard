import type { OverviewAction, TeamMember } from "@/features/overview/types";

export const setSearchTerm = (searchTerm: string): OverviewAction => ({
  type: "SET_SEARCH_TERM",
  payload: searchTerm,
});

export const setPage = (page: number): OverviewAction => ({
  type: "SET_PAGE",
  payload: page,
});

export const setSelectedMember = (member: TeamMember | null): OverviewAction => ({
  type: "SET_SELECTED_MEMBER",
  payload: member,
});
