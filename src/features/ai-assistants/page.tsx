"use client";

import React from "react";
import { AiAssistantsProvider } from "./context";
import { AiAssistantsContent } from "./components/ai-assistants-content";

export default function AiAssistantsPage() {
  return (
    <AiAssistantsProvider>
      <AiAssistantsContent />
    </AiAssistantsProvider>
  );
}
