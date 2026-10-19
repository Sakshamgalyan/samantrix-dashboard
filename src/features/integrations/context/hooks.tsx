import { useContext } from "react";
import { IntegrationsContext } from "@/features/integrations/context/index";
import type { IntegrationsContextValue } from "@/features/integrations/types/context";

export function useIntegrations(): IntegrationsContextValue {
  const context = useContext(IntegrationsContext);
  if (!context) {
    throw new Error("useIntegrations must be used within an IntegrationsProvider");
  }
  return context;
}
