"use client";

import { DevelopersProvider } from "@/features/developers/context";
import { DevelopersContent } from "@/features/developers/components/developers-content";

/** /admin/developers: review, approve, re-role and revoke developer accounts. */
export function AdminDevelopersPage() {
  return (
    <DevelopersProvider>
      <DevelopersContent />
    </DevelopersProvider>
  );
}

export default AdminDevelopersPage;
