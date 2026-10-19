"use client";

import { LeadsProvider } from "@/features/leads/context";
import { LeadsContent } from "@/features/leads/components/leads-content";

/** /admin/leads: enquiries from simantrix-home — contact, follow up, quote and convert. */
export const AdminLeadsPage = () => {
  return (
    <LeadsProvider>
      <LeadsContent />
    </LeadsProvider>
  );
};

export default AdminLeadsPage;
