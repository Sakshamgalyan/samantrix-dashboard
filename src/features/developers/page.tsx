"use client";

import { DevelopersProvider } from "./context";
import { DevelopersContent } from "./components/developers-content";

/** /admin/developers: review, approve, re-role and revoke developer accounts. */
export function AdminDevelopersPage() {
  return (
    <DevelopersProvider>
      <DevelopersContent />
    </DevelopersProvider>
  );
}

export default AdminDevelopersPage;
