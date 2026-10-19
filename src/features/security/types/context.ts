import type { Dispatch } from "react";
import type { SecurityState } from "@/features/security/types/state";
import type { SecurityAction } from "@/features/security/types/actions";

export interface SecurityContextValue {
  state: SecurityState;
  dispatch: Dispatch<SecurityAction>;
}
