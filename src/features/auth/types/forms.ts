import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid work email address"),
  password: z.string().min(1, "Master password is required"),
  rememberWorkstation: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const twoFactorSchema = z.object({
  twoFactorCode: z
    .string()
    .min(6, "Verification code must be at least 6 characters")
    .max(32, "Code is too long"),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

// Forgot password: email → emailed 6-digit code → new password
export const forgotEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid work email address"),
});

export type ForgotEmailFormValues = z.infer<typeof forgotEmailSchema>;

export const resetCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from the email"),
});

export type ResetCodeFormValues = z.infer<typeof resetCodeSchema>;

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export const orgRegistrationSchema = z
  .object({
    // Step 1: Organization Profile
    organizationName: z
      .string()
      .min(2, "Organization name must be at least 2 characters"),
    legalName: z.string(),
    orgType: z.string(),
    industry: z.string(),
    companySize: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    website: z.string(),
    businessEmail: z.string(),
    businessPhone: z.string(),
    address: z.string(),

    // Step 2: Root Admin
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .min(1, "Admin work email is required")
      .email("Please enter a valid work email"),
    mobilePhone: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),

    // Step 3: Security & TOTP
    setup2FA: z.boolean(),
    twoFactorSecret: z.string(),
    twoFactorCode: z.string(),

    // Step 4: Legal & Consent
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service",
    }),
    privacyAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Privacy Policy",
    }),
    communicationOptIn: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type OrgRegistrationFormValues = z.infer<typeof orgRegistrationSchema>;

// Alias for existing components expecting OrgFormData
export type OrgFormData = OrgRegistrationFormValues;
