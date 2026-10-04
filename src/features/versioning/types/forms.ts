import { z } from "zod";
import { RELEASE_APPS, RELEASE_CHANNELS } from "./api";

/** Same rule as the backend: 1.4.0, 1.4.0-beta.2, 2.0.0+build.7 */
export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export const releaseFormSchema = z.object({
  app: z.enum(RELEASE_APPS, { message: "Choose an app" }),
  version: z
    .string()
    .trim()
    .min(1, "Version is required")
    .max(64, "Version is too long")
    .regex(SEMVER_PATTERN, "Use a version like 1.4.0 or 1.4.0-beta.2"),
  channel: z.enum(RELEASE_CHANNELS),
  title: z
    .string()
    .trim()
    .min(1, "Give the release a title")
    .max(120, "Keep the title under 120 characters"),
  notes: z.string().max(10000, "Release notes are too long"),
  isMandatory: z.boolean(),
});

export type ReleaseFormValues = z.infer<typeof releaseFormSchema>;

export const rolloutPercentSchema = z
  .number()
  .int("Use a whole number")
  .min(1, "At least 1%")
  .max(99, "Use Release to go to 100%");
