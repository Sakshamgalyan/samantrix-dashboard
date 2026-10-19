import type React from "react";
import type { AiAssistantsState } from "./state";
import type { AiAssistantsAction } from "./actions";

export interface AiAssistantsContextValue {
  state: AiAssistantsState;
  dispatch: React.Dispatch<AiAssistantsAction>;
}
