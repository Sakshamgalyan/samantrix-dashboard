"use client";

import React from "react";
import { FeatureFlagsProvider } from "./context";
import { FeatureFlagsContent } from "./components/feature-flags-content";

export default function FeatureFlagsPage() {
  return (
    <FeatureFlagsProvider>
      <FeatureFlagsContent />
    </FeatureFlagsProvider>
  );
}
