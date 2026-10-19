import { useContext } from "react";
import { QueuesContext } from "@/features/queues/context";
import type { QueuesContextValue } from "@/features/queues/context/types";

export const useQueues = (): QueuesContextValue => {
  const context = useContext(QueuesContext);
  if (!context) {
    throw new Error("useQueues must be used within a QueuesProvider");
  }
  return context;
};

