import type { LeadDetail, LeadListItem, LeadsPage, LeadsSummary } from "./api";
import type { StatusFilter, TypeFilter } from "./state";

export type LeadsAction =
  | { type: "SUMMARY_LOADED"; payload: LeadsSummary }
  | { type: "SUMMARY_FAILED"; payload: string }
  | { type: "LIST_REQUESTED" }
  | { type: "LIST_LOADED"; payload: LeadsPage }
  | { type: "LIST_FAILED"; payload: string }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_TYPE_FILTER"; payload: TypeFilter }
  | { type: "SET_STATUS_FILTER"; payload: StatusFilter }
  | { type: "SET_SEARCH_INPUT"; payload: string }
  | { type: "APPLY_SEARCH"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_SELECTED_IDS"; payload: string[] }
  | { type: "SET_INVITE_DIALOG"; payload: boolean }
  | { type: "SET_INVITING"; payload: boolean }
  | { type: "OPEN_DETAIL"; payload: string }
  | { type: "DETAIL_LOADED"; payload: LeadDetail }
  | { type: "DETAIL_FAILED"; payload: string }
  | { type: "CLOSE_DETAIL" }
  | { type: "SET_STATUS_UPDATING"; payload: string | null }
  | { type: "LEAD_UPDATED"; payload: LeadListItem | LeadDetail }
  | { type: "SET_NOTE_SUBMITTING"; payload: boolean };
