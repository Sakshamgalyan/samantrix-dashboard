export type PresenceStatus = "ONLINE" | "BUSY" | "IN_MEETING" | "AWAY" | "OFFLINE";

export interface TeamMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  presenceStatus?: PresenceStatus;
  lastActive?: string;
}

export * from "@/features/overview/admin/types";
