import { z } from "zod";

const CATEGORIES = ["GENERAL", "AUTH", "BILLING", "INTEGRATION"] as const;

/** Same rule as the backend: lower-case dot-separated segments, at least two. */
export const SETTING_KEY_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export const addSettingSchema = z.object({
  key: z
    .string()
    .trim()
    .min(3, "Key is required")
    .max(100, "Key is too long")
    .regex(
      SETTING_KEY_PATTERN,
      "Use lower-case dot-separated words, e.g. integration.slack_channel",
    ),
  value: z
    .string()
    .trim()
    .min(1, "Value is required")
    .max(2000, "Value is too long"),
  description: z.string().trim().max(300, "Keep it under 300 characters"),
  category: z.enum(CATEGORIES),
  isSecret: z.boolean(),
});

export type AddSettingFormValues = z.infer<typeof addSettingSchema>;

export const editSettingSchema = z.object({
  description: z.string().trim().max(300, "Keep it under 300 characters"),
  category: z.enum(CATEGORIES),
});

export type EditSettingFormValues = z.infer<typeof editSettingSchema>;
