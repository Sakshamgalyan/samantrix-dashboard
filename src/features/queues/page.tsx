"use client";

import React from "react";
import { QueuesProvider } from "@/features/queues/context";
import { QueuesContent } from "@/features/queues/components/queues-content";

export const QueuesPage = () => {
  return (
    <QueuesProvider>
      <QueuesContent />
    </QueuesProvider>
  );
};

export default QueuesPage;

