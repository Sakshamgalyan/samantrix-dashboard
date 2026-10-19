export interface OrgFleetSession {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  department?: string | null;
  jobTitle?: string | null;
  deviceId: string;
  deviceName: string;
  clientType: "DESKTOP" | "BROWSER" | "MOBILE";
  os: string;
  isDesktopApp: boolean;
  ipAddress: string;
  loginAt: string;
  lastSeenAt: string;
  expiresAt: string;
}
