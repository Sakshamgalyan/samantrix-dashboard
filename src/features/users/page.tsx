"use client";

import React from "react";
import { UsersProvider } from "@/features/users/context";
import { UsersContent } from "@/features/users/components/users-content";

export default function UsersManagementPage() {
  return (
    <UsersProvider>
      <UsersContent />
    </UsersProvider>
  );
}
