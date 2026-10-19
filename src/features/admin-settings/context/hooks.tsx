import { useContext } from "react";
import { SettingsPageContext } from "@/features/admin-settings/context/index";
import type { SettingsPageContextType } from "@/features/admin-settings/types/context";

export const useSettingsContext = (): SettingsPageContextType => {
  const ctx = useContext(SettingsPageContext);
  if (!ctx) {
    throw new Error(
      "useSettingsContext must be used within a SettingsPageProvider",
    );
  }
  return ctx;
};
