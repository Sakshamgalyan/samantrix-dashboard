import type { Dispatch } from "react";
import type { IntegrationsState } from "@/features/integrations/types/state";
import type { IntegrationsAction } from "@/features/integrations/types/actions";

export interface IntegrationsContextValue {
  state: IntegrationsState;
  dispatch: Dispatch<IntegrationsAction>;
}
