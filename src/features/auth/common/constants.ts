import type { DropdownOption, Step } from "@galyan/ui";
import type { OrgFormData } from "@/features/auth/types/forms";

export const INITIAL_ORG_FORM: OrgFormData = {
  organizationName: "",
  legalName: "",
  orgType: "Private Corporation",
  industry: "Software & Technology",
  companySize: "1-10",
  country: "United States",
  state: "",
  city: "",
  website: "",
  businessEmail: "",
  businessPhone: "",
  address: "",

  firstName: "",
  lastName: "",
  email: "",
  mobilePhone: "",
  password: "",
  confirmPassword: "",

  setup2FA: false,
  twoFactorSecret: "",
  twoFactorCode: "",

  termsAccepted: false,
  privacyAccepted: false,
  communicationOptIn: false,
};

export const ORG_TYPE_OPTIONS: DropdownOption[] = [
  { label: "Private Corporation (Inc / Ltd)", value: "Private Corporation" },
  { label: "Limited Liability Company (LLC)", value: "Limited Liability Company" },
  { label: "Public Enterprise", value: "Public Enterprise" },
  { label: "Non-Profit Organization", value: "Non-Profit" },
  { label: "Sole Proprietorship / Partnership", value: "Sole Proprietorship" },
];

export const INDUSTRY_OPTIONS: DropdownOption[] = [
  { label: "Software & Technology", value: "Software & Technology" },
  { label: "Financial Services & Fintech", value: "Financial Services" },
  { label: "Healthcare & Life Sciences", value: "Healthcare & Life Sciences" },
  { label: "Manufacturing & Robotics", value: "Manufacturing" },
  { label: "Education & Academic", value: "Education" },
  { label: "Media & Entertainment", value: "Media & Entertainment" },
  { label: "Consulting & Professional Services", value: "Consulting" },
  { label: "Other", value: "Other" },
];

export const COMPANY_SIZE_OPTIONS: DropdownOption[] = [
  { label: "1-10 employees (Startup Seed)", value: "1-10" },
  { label: "11-50 employees (Growth Stage)", value: "11-50" },
  { label: "51-200 employees (Mid-Market)", value: "51-200" },
  { label: "201-1000 employees (Scale-Up)", value: "201-1000" },
  { label: "1000+ employees (Global Enterprise)", value: "1000+" },
];

export const COUNTRY_OPTIONS: DropdownOption[] = [
  { label: "United States", value: "United States" },
  { label: "India", value: "India" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "Germany", value: "Germany" },
  { label: "Canada", value: "Canada" },
  { label: "Australia", value: "Australia" },
  { label: "Singapore", value: "Singapore" },
  { label: "Japan", value: "Japan" },
  { label: "Other", value: "Other" },
];

export const STEP_DEFINITIONS: Step[] = [
  { id: "step-1", label: "Organization", description: "Company profile" },
  { id: "step-2", label: "Root Admin", description: "Master account" },
  { id: "step-3", label: "Security", description: "2FA protection" },
  { id: "step-4", label: "Review & Legal", description: "Confirmation" },
];

export const SHOWCASE_FEATURES = [
  {
    iconName: "ShieldCheck",
    title: "Zero-Trust Architecture",
    description: "Hardware-grade token encryption, TOTP authenticator protection, and granular tenant isolation.",
  },
  {
    iconName: "Globe2",
    title: "Virtual Workplace Ecosystem",
    description: "Next-generation 3D spatial presence, procedural virtual rooms, and seamless real-time meetings.",
  },
  {
    iconName: "Cpu",
    title: "Multi-Tenant Platform",
    description: "Autonomous database isolation per enterprise tenant with strict organization boundary governance.",
  },
  {
    iconName: "Code2",
    title: "Extensible Developer SDK",
    description: "Build custom integrations, workplace bots, and spatial experiences with our unified TypeScript API.",
  },
];

export const SHOWCASE_STATS = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "<15ms", label: "Realtime Sync" },
  { value: "SOC2", label: "Compliant" },
  { value: "256-bit", label: "Encryption" },
];
