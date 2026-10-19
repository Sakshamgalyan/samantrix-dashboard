export const SETUP_FORM_ID = "security-2fa-setup-form";
export const DISABLE_FORM_ID = "security-2fa-disable-form";

export const SECURITY_FACTS = [
  {
    label: "Standard RFC 6238",
    value: "Compatible with Google, Microsoft and 1Password",
    tone: "text-[var(--gy-text)]",
  },
  {
    label: "Secret storage",
    value: "AES-256-GCM encrypted at rest",
    tone: "text-[var(--gy-success)]",
  },
  {
    label: "Backup recovery",
    value: "SHA-256 hashed single-use codes",
    tone: "text-[var(--gy-text)]",
  },
] as const;
