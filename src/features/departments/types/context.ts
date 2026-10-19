import type React from "react";
import type { DepartmentsState } from "./state";
import type { DepartmentsAction } from "./actions";

export interface DepartmentsContextValue {
  state: DepartmentsState;
  dispatch: React.Dispatch<DepartmentsAction>;
}
