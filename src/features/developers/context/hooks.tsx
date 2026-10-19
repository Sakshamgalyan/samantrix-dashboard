import { useContext } from "react";
import { DevelopersContext } from "@/features/developers/context/index";
import type { DevelopersContextType } from "@/features/developers/types";

export function useDevelopersContext(): DevelopersContextType {
  const context = useContext(DevelopersContext);
  if (!context) {
    throw new Error(
      "useDevelopersContext must be used within a DevelopersProvider",
    );
  }
  return context;
}
