"use client";

import React from "react";
import { FeatureFlagsProvider } from "@/features/feature-flags/context";
import { FeatureFlagsContent } from "@/features/feature-flags/components/feature-flags-content";

export const FeatureFlagsPage = () => {
  return (
    <FeatureFlagsProvider>
      <FeatureFlagsContent />
    </FeatureFlagsProvider>
  );
};

export default FeatureFlagsPage;
