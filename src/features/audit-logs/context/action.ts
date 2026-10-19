import type { AuditLogsAction } from "@/features/audit-logs/types/actions";

export const setSearchAction = (payload: string): AuditLogsAction => ({
  type: "SET_SEARCH",
  payload,
});

export const setActionFilterAction = (payload: string): AuditLogsAction => ({
  type: "SET_ACTION_FILTER",
  payload,
});

export const setAuditPageAction = (payload: number): AuditLogsAction => ({
  type: "SET_PAGE",
  payload,
});

export const resetFiltersAction = (): AuditLogsAction => ({
  type: "RESET_FILTERS",
});

export const setClearModalOpenAction = (payload: boolean): AuditLogsAction => ({
  type: "SET_CLEAR_MODAL_OPEN",
  payload,
});

export const setClearingAction = (payload: boolean): AuditLogsAction => ({
  type: "SET_CLEARING",
  payload,
});
