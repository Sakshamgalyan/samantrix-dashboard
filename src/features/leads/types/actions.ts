import type { DetailDialog, LeadsFilters, LeadsTab, WaitlistFilters } from "@/features/leads/types/state";

export type LeadsAction =
  | { type: "SET_TAB"; payload: LeadsTab }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_FILTERS"; payload: Partial<Omit<LeadsFilters, "page">> }
  | { type: "APPLY_SEARCH"; payload: string }
  | { type: "SET_SEARCH_INPUT"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_WAITLIST_STATUS"; payload: WaitlistFilters["status"] }
  | { type: "APPLY_WAITLIST_SEARCH"; payload: string }
  | { type: "SET_WAITLIST_SEARCH_INPUT"; payload: string }
  | { type: "SET_WAITLIST_PAGE"; payload: number }
  | { type: "SET_WAITLIST_SELECTION"; payload: string[] }
  | { type: "OPEN_DETAIL"; payload: string }
  | { type: "CLOSE_DETAIL" }
  | { type: "SET_TIMELINE_PAGE"; payload: number }
  | { type: "SET_DIALOG"; payload: DetailDialog }
  | { type: "SET_SAVING"; payload: boolean };
