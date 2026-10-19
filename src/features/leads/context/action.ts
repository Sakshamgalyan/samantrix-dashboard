import type { DetailDialog, LeadsAction, LeadsFilters, LeadsTab, WaitlistFilters } from "@/features/leads/types";

export const setTab = (tab: LeadsTab): LeadsAction => ({ type: "SET_TAB", payload: tab });
export const setRefreshing = (value: boolean): LeadsAction => ({
  type: "SET_REFRESHING",
  payload: value,
});
export const setFilters = (filters: Partial<Omit<LeadsFilters, "page">>): LeadsAction => ({
  type: "SET_FILTERS",
  payload: filters,
});
/** Applies the debounced search term (no-op when it hasn't changed). */
export const applySearch = (search: string): LeadsAction => ({ type: "APPLY_SEARCH", payload: search });
export const setSearchInput = (value: string): LeadsAction => ({
  type: "SET_SEARCH_INPUT",
  payload: value,
});
export const setPage = (page: number): LeadsAction => ({ type: "SET_PAGE", payload: page });
export const setWaitlistStatus = (status: WaitlistFilters["status"]): LeadsAction => ({
  type: "SET_WAITLIST_STATUS",
  payload: status,
});
/** Applies the debounced waitlist search (no-op when it hasn't changed). */
export const applyWaitlistSearch = (search: string): LeadsAction => ({
  type: "APPLY_WAITLIST_SEARCH",
  payload: search,
});
export const setWaitlistSearchInput = (value: string): LeadsAction => ({
  type: "SET_WAITLIST_SEARCH_INPUT",
  payload: value,
});
export const setWaitlistPage = (page: number): LeadsAction => ({ type: "SET_WAITLIST_PAGE", payload: page });
export const setTimelinePage = (page: number): LeadsAction => ({ type: "SET_TIMELINE_PAGE", payload: page });
export const setWaitlistSelection =(ids: string[]): LeadsAction => ({
  type: "SET_WAITLIST_SELECTION",
  payload: ids,
});
export const openDetail = (id: string): LeadsAction => ({ type: "OPEN_DETAIL", payload: id });
export const closeDetail = (): LeadsAction => ({ type: "CLOSE_DETAIL" });
export const setDialog = (dialog: DetailDialog): LeadsAction => ({ type: "SET_DIALOG", payload: dialog });
export const setSaving = (value: boolean): LeadsAction => ({ type: "SET_SAVING", payload: value });
