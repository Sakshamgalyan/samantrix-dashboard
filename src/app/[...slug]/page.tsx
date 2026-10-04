import { DashboardClient } from "./client";

/**
 * Every console URL (`/admin/*` for developers, `/overview`, `/users`, … for organizations)
 * lands here; React Router resolves the screen client-side. `/` itself is the sign-in page.
 */
export default function DashboardPage() {
  return <DashboardClient />;
}
