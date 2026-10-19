import { z } from "zod";

export const leadActivitySchema = z.object({
  type: z.enum(["NOTE", "CALL", "MEETING"]),
  body: z
    .string()
    .trim()
    .min(1, "Write something first")
    .max(5000, "At most 5,000 characters"),
});
export type LeadActivityFormValues = z.infer<typeof leadActivitySchema>;

export const leadEmailSchema = z.object({
  subject: z.string().trim().min(1, "Add a subject").max(200, "At most 200 characters"),
  body: z.string().trim().min(1, "Write the message").max(10000, "At most 10,000 characters"),
});
export type LeadEmailFormValues = z.infer<typeof leadEmailSchema>;

export const quoteItemSchema = z.object({
  description: z.string().trim().min(1, "Describe the item").max(200),
  quantity: z.number().positive("Quantity must be above 0"),
  unitPrice: z.number().min(0, "Price can't be negative"),
});

export const leadQuoteSchema = z.object({
  planTier: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  seats: z.number().int().min(1, "At least 1 seat"),
  items: z.array(quoteItemSchema).min(1, "Add at least one line item"),
  discount: z.number().min(0, "Discount can't be negative"),
  taxPercent: z.number().min(0).max(100),
  validUntil: z.string().min(1, "Pick a date"),
  notes: z.string().max(4000).optional(),
});
export type LeadQuoteFormValues = z.infer<typeof leadQuoteSchema>;
