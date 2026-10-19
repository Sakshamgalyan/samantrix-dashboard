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

export const RELEASE_CHANGE_TYPES = ["feature", "improvement", "fix"] as const;
export type ReleaseChangeType = (typeof RELEASE_CHANGE_TYPES)[number];

/** One line of the public changelog on the Simantrix website. */
export interface ReleaseChange {
  type: ReleaseChangeType;
  text: string;
}

export type ReleaseApp = (typeof RELEASE_APPS)[number];
export type ReleaseChannel = (typeof RELEASE_CHANNELS)[number];
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

/** A row of `GET /versioning/releases` (one page; no notes, changelog lines or download link). */
export interface ReleaseListItem {
  id: string;
  app: ReleaseApp;
  version: string;
  channel: ReleaseChannel;
  status: ReleaseStatus;
  title: string;
  summary: string | null;
  rolloutPercent: number;
  isMandatory: boolean;
  /** Listed on the website changelog once released. */
  showOnHome: boolean;
  releasedAt: string | null;
  createdAt: string;
  createdBy: { fullName: string } | null;
}

/** `GET /versioning/releases/:id`: everything the edit dialog needs. */
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
  /** Listed on the website changelog once released. */
  showOnHome: boolean;
  summary: string | null;
  changes: ReleaseChange[];
  downloadUrl: string | null;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; fullName: string } | null;
}

/** A live or rolling-out version in the summary. */
export interface ReleaseBrief {
  id: string;
  app: ReleaseApp;
  version: string;
  channel: ReleaseChannel;
  rolloutPercent: number;
  releasedAt: string | null;
}

export interface VersioningSummary {
  /** Live (latest released) version per app + channel. */
  current: ReleaseBrief[];
  rollingOut: ReleaseBrief[];
  counts: Record<ReleaseStatus, number> & { total: number };
  /** Releases per app (every app present). */
  byApp: Record<ReleaseApp, number>;
  /** Released versions listed on the website changelog. */
  publishedOnWebsite: number;
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
  showOnHome: boolean;
  summary?: string;
  changes: ReleaseChange[];
  downloadUrl?: string;
}

/** Core fields only apply to drafts; website fields can change at any status (empty string clears). */
export type UpdateReleasePayload = Partial<Omit<CreateReleasePayload, "app">>;

/** Fields that stay editable after a release ships. */
export type WebsiteDetailsPayload = Pick<
  UpdateReleasePayload,
  "showOnHome" | "summary" | "changes" | "downloadUrl"
>;

export interface TransitionReleasePayload {
  status: Exclude<ReleaseStatus, "DRAFT">;
  rolloutPercent?: number;
}
