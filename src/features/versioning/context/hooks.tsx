import { useContext } from "react";
import { VersioningContext } from "@/features/versioning/context/index";
import type { VersioningContextType } from "@/features/versioning/types";

export const useVersioningContext = (): VersioningContextType => {
  const ctx = useContext(VersioningContext);
  if (!ctx) {
    throw new Error(
      "useVersioningContext must be used within a VersioningProvider",
    );
  }
  return ctx;
};
