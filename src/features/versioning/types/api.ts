/** Contracts of the backend `/versioning` endpoints. */

export const RELEASE_APPS = [
  "BACKEND",
  "FRONTEND",
  "DASHBOARD",
  "HOME",
  "DESKTOP",
  "UNITY",
] as const;
export const RELEASE_CHANNELS = ["STABLE", "BETA", "CANARY"] as const;
export const RELEASE_STATUSES = [
  "DRAFT",
  "ROLLING_OUT",
  "RELEASED",
  "ROLLED_BACK",
] as const;

export type ReleaseApp = (typeof RELEASE_APPS)[number];
export type ReleaseChannel = (typeof RELEASE_CHANNELS)[number];
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

export interface Release {
  id: string;
  app: ReleaseApp;
  version: string;
  channel: ReleaseChannel;
  status: ReleaseStatus;
  title: string;
  notes: string | null;
  rolloutPercent: number;
  isMandatory: boolean;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; fullName: string } | null;
}

export interface VersioningSummary {
  /** Live (latest released) version per app + channel. */
  current: Release[];
  rollingOut: Release[];
  counts: Record<ReleaseStatus, number> & { total: number };
  appsLive: number;
  releasedLast30Days: number;
  createdLast30Days: number;
  generatedAt: string;
}

export interface CreateReleasePayload {
  app: ReleaseApp;
  version: string;
  channel: ReleaseChannel;
  title: string;
  notes?: string;
  isMandatory: boolean;
}

export type UpdateReleasePayload = Partial<Omit<CreateReleasePayload, "app">>;

export interface TransitionReleasePayload {
  status: Exclude<ReleaseStatus, "DRAFT">;
  rolloutPercent?: number;
}
