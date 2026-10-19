"use client";

import React from "react";
import { FeaturesProvider } from "@/features/features/context";
import { FeaturesContent } from "@/features/features/components/features-content";

export const FeaturesPage = () => {
  return (
    <FeaturesProvider>
      <FeaturesContent />
    </FeaturesProvider>
  );
};

export default FeaturesPage;
