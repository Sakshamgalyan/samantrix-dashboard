import { z } from "zod";

export const leadNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a note first")
    .max(2000, "Notes can be at most 2,000 characters"),
});

export type LeadNoteFormValues = z.infer<typeof leadNoteSchema>;
