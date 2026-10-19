import { Building2, ShieldCheck } from "lucide-react";

export const SCOPE_TABS = [
  { id: "admin", label: "Developer", icon: <ShieldCheck className="size-3.5" /> },
  { id: "workspace", label: "Workspace", icon: <Building2 className="size-3.5" /> },
];

export const WORKPLACE_URL = process.env.NEXT_PUBLIC_WORKPLACE_URL || "http://localhost:4200/office";
