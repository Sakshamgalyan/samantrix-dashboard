import type { Dispatch } from "react";
import type { SettingsState } from "@/features/settings/types/state";
import type { SettingsAction } from "@/features/settings/types/actions";

export interface SettingsContextValue {
  state: SettingsState;
  dispatch: Dispatch<SettingsAction>;
}
