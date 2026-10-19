import {
  Code2,
  Target,
  Palette,
  Megaphone,
  Briefcase,
  Cpu,
  CreditCard,
  Headphones,
  Users,
  ShieldCheck,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface DepartmentMeta {
  name: string;
  icon: LucideIcon;
  badgeVariant: "primary" | "success" | "warning" | "neutral" | "danger";
  description: string;
}

export const DEPARTMENT_METAS: Record<string, DepartmentMeta> = {
  Engineering: {
    name: "Engineering",
    icon: Code2,
    badgeVariant: "primary",
    description: "Core architecture, microservices, and client runtime development.",
  },
  Product: {
    name: "Product",
    icon: Target,
    badgeVariant: "warning",
    description: "Roadmap prioritization, specifications, and growth features.",
  },
  Design: {
    name: "Design",
    icon: Palette,
    badgeVariant: "success",
    description: "Product UI/UX design, visual design system, and user research.",
  },
  Marketing: {
    name: "Marketing",
    icon: Megaphone,
    badgeVariant: "neutral",
    description: "Acquisition campaigns, brand voice, content, and events.",
  },
  Sales: {
    name: "Sales",
    icon: Briefcase,
    badgeVariant: "warning",
    description: "Enterprise sales, client demos, and recurring revenue accounts.",
  },
  Operations: {
    name: "Operations",
    icon: Cpu,
    badgeVariant: "neutral",
    description: "Internal tooling, cloud infrastructure, and operational reliability.",
  },
  Finance: {
    name: "Finance",
    icon: CreditCard,
    badgeVariant: "neutral",
    description: "Accounting, payroll, audit trails, and subscription invoicing.",
  },
  "Customer Support": {
    name: "Customer Support",
    icon: Headphones,
    badgeVariant: "success",
    description: "Customer onboarding, ticket resolution, and workplace happiness.",
  },
  HR: {
    name: "HR & People",
    icon: Users,
    badgeVariant: "primary",
    description: "Talent acquisition, team culture, and employee success.",
  },
  Legal: {
    name: "Legal & Compliance",
    icon: ShieldCheck,
    badgeVariant: "neutral",
    description: "Corporate governance, contract terms, and data privacy.",
  },
};

export const DEFAULT_DEPARTMENT_META: DepartmentMeta = {
  name: "General / Unassigned",
  icon: Layers,
  badgeVariant: "neutral",
  description: "Members pending specific department or team assignment.",
};

export function getDepartmentMeta(name: string): DepartmentMeta {
  return DEPARTMENT_METAS[name] || {
    ...DEFAULT_DEPARTMENT_META,
    name,
  };
}

export const DEPARTMENT_OPTIONS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Customer Support",
  "HR",
  "Legal",
];
