export type ServiceMetricStatus = "optimal" | "warning" | "critical";

export interface ServiceMetric {
  name: string;
  value: string;
  status: ServiceMetricStatus;
}

export type ServiceStatus = "HEALTHY" | "ONLINE" | "OFFLINE" | "DEGRADED" | "READY";

export interface EcosystemService {
  id: "backend" | "frontend" | "home" | "desktop" | string;
  name: string;
  description: string;
  status: ServiceStatus;
  version: string;
  url: string;
  port: number;
  latencyMs?: number;
  uptime: string;
  activeConnections: number;
  metrics: ServiceMetric[];
  lastDeployed: string;
}

export type ServiceFilter = "ALL" | "ONLINE" | "DEGRADED" | "OFFLINE";
