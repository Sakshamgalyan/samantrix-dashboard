import { z } from "zod";

/** Dropdown value that reveals the "new category" input. */
export const NEW_CATEGORY = "__new__";

export const featureFormSchema = z
  .object({
    featureKey: z
      .string()
      .trim()
      .min(3, "Use at least 3 characters")
      .max(64, "Use at most 64 characters")
      .regex(
        /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/,
        "Lowercase snake_case starting with a letter, e.g. custom_branding",
      ),
    name: z
      .string()
      .trim()
      .min(2, "Name is required")
      .max(80, "Use at most 80 characters"),
    description: z.string().trim().max(500, "Use at most 500 characters"),
    category: z.string().min(1, "Pick a category"),
    newCategory: z.string().trim(),
    minPlanTier: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]),
    defaultEnabled: z.boolean(),
    isEnabled: z.boolean(),
    isBeta: z.boolean(),
    /** Optional INR / month; empty means "included in the plan" */
    addonPrice: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= 10_000_000),
        "Enter an amount like 499 or 499.50",
      ),
  })
  .superRefine((values, ctx) => {
    if (
      values.category === NEW_CATEGORY &&
      (values.newCategory.length < 2 || values.newCategory.length > 40)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["newCategory"],
        message: "Category names are 2–40 characters",
      });
    }
  });

export type FeatureFormValues = z.infer<typeof featureFormSchema>;
