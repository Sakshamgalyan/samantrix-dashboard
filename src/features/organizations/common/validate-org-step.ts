import {
  EMAIL_RE,
  type FormValues,
} from "@/features/organizations/common/form-types";

export const validateOrgStep = (
  stepIndex: number,
  values: FormValues,
  editing: boolean,
  ownerMode: "new" | "existing",
): { valid: boolean; errors: Partial<Record<keyof FormValues, string>> } => {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (stepIndex === 0) {
    if (values.name.trim().length < 2) {
      errors.name = "Enter the organization name (at least 2 characters)";
    }
  } else if (stepIndex === 1) {
    if (values.businessEmail && !EMAIL_RE.test(values.businessEmail.trim())) {
      errors.businessEmail = "Enter a valid business email address";
    }
  } else if (stepIndex === 2) {
    const members = Number(values.maxMembers);
    if (!Number.isInteger(members) || members < 1) {
      errors.maxMembers = "Member limit must be a whole number, 1 or more";
    }
    const workspaces = Number(values.maxWorkspaces);
    if (!Number.isInteger(workspaces) || workspaces < 1) {
      errors.maxWorkspaces =
        "Workspace limit must be a whole number, 1 or more";
    }
  } else if (stepIndex === 3) {
    if (!editing) {
      if (!EMAIL_RE.test(values.ownerEmail.trim())) {
        errors.ownerEmail = "Enter a valid email for the root administrator";
      }
      if (ownerMode === "new" && values.ownerFullName.trim().length < 2) {
        errors.ownerFullName =
          "Enter the owner's full name (at least 2 characters)";
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
