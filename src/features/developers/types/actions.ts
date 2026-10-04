import type { DevelopersResponse } from "./api";
import type { DeveloperDialog, DeveloperTab } from "./state";

export type DevelopersAction =
  | { type: "LOAD_SUCCESS"; payload: DevelopersResponse }
  | { type: "LOAD_FAILURE"; payload: string }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_TAB"; payload: DeveloperTab }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "OPEN_DIALOG"; payload: { dialog: DeveloperDialog; role: string } }
  | { type: "CLOSE_DIALOG" }
  | { type: "SET_ROLE"; payload: string }
  | { type: "SET_SUBMITTING"; payload: boolean };
