"use client";

import { VersioningProvider } from "@/features/versioning/context";
import { VersioningContent } from "@/features/versioning/components/versioning-content";

const VersioningPage = () => {
  return (
    <VersioningProvider>
      <VersioningContent />
    </VersioningProvider>
  );
};

export default VersioningPage;
