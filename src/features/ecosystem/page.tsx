"use client";

import React from "react";
import { EcosystemProvider } from "@/features/ecosystem/context";
import { EcosystemContent } from "@/features/ecosystem/components/ecosystem-content";

export const EcosystemPage = () => {
  return (
    <EcosystemProvider>
      <EcosystemContent />
    </EcosystemProvider>
  );
};

export default EcosystemPage;

