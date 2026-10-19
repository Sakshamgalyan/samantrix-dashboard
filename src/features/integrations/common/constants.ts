export interface EcosystemTool {
  name: string;
  description: string;
  status: string;
}

export const ECOSYSTEM_TOOLS: EcosystemTool[] = [
  {
    name: "Slack Workplace",
    description: "Push virtual room presence alerts and meeting reminders directly to Slack channels.",
    status: "Available in Enterprise",
  },
  {
    name: "Google Calendar",
    description: "Synchronize scheduled calendar events into automatically reserved 3D meeting spaces.",
    status: "Available in Enterprise",
  },
  {
    name: "Discord Bot Bridge",
    description: "Sync voice states and proximity audio between your Discord server and Simantrix.",
    status: "Available in Enterprise",
  },
];

export const CREATE_FORM_ID = "integrations-create-key-form";

export const GITHUB_WEBHOOK_ENDPOINT = "/api/v1/github/webhook";

/**
 * Proper GitHub Webhook receiver URL constant.
 * Uses environment variables if configured, falling back to local backend (port 5000)
 * or production endpoints.
 */
export const GITHUB_WEBHOOK_URL: string =
  process.env.NEXT_PUBLIC_GITHUB_WEBHOOK_URL ||
  (process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "")}${GITHUB_WEBHOOK_ENDPOINT}`
    : process.env.NEXT_PUBLIC_SOCKET_URL
    ? `${process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, "")}${GITHUB_WEBHOOK_ENDPOINT}`
    : "http://localhost:5000/api/v1/github/webhook");

export const DEFAULT_GITHUB_WEBHOOK_URL = GITHUB_WEBHOOK_URL;

export const getGitHubWebhookUrl = (): string => {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_GITHUB_WEBHOOK_URL) {
      return process.env.NEXT_PUBLIC_GITHUB_WEBHOOK_URL;
    }
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return `http://${window.location.hostname}:5000${GITHUB_WEBHOOK_ENDPOINT}`;
    }
    return `${window.location.origin}${GITHUB_WEBHOOK_ENDPOINT}`;
  }
  return GITHUB_WEBHOOK_URL;
};
