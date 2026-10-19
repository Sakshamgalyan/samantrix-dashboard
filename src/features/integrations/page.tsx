"use client";

import { IntegrationsProvider } from "@/features/integrations/context";
import { IntegrationsContent } from "@/features/integrations/components/integrations-content";

const IntegrationsPage = () => {
  return (
    <IntegrationsProvider>
      <IntegrationsContent />
    </IntegrationsProvider>
  );
};

export default IntegrationsPage;

