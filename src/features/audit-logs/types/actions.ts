export type AuditLogsAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_ACTION_FILTER"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "RESET_FILTERS" }
  | { type: "SET_CLEAR_MODAL_OPEN"; payload: boolean }
  | { type: "SET_CLEARING"; payload: boolean };
