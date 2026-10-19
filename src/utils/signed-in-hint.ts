/**
 * "Signed in to" hint shared with the public website (simantrix-home), which shows
 * "Go to Simantrix" / "Go to dashboard" instead of "Sign in" while this cookie lists an app.
 * It holds no token or user data, only which apps this browser is signed in to.
 * Set NEXT_PUBLIC_SHARED_COOKIE_DOMAIN (e.g. ".Simantrix.com") when the apps live on different
 * subdomains; on localhost the cookie is already shared across ports.
 */
export const SIGNED_IN_APPS_COOKIE = "Simantrix_signed_in_apps";

export type SignedInApp = "DASHBOARD" | "OFFICE";

const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // as long as a refresh token

function readApps(): SignedInApp[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie.match(new RegExp(`(?:^|; )${SIGNED_IN_APPS_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : "";
  return value
    .split(",")
    .filter((app): app is SignedInApp => app === "DASHBOARD" || app === "OFFICE");
}

function writeApps(apps: SignedInApp[]) {
  if (typeof document === "undefined") return;
  const domain = process.env.NEXT_PUBLIC_SHARED_COOKIE_DOMAIN;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const scope = `; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ""}${secure}`;
  document.cookie =
    apps.length > 0
      ? `${SIGNED_IN_APPS_COOKIE}=${encodeURIComponent(apps.join(","))}${scope}; max-age=${MAX_AGE_SECONDS}`
      : `${SIGNED_IN_APPS_COOKIE}=${scope}; max-age=0`;
}

/** Records that this browser is (or no longer is) signed in to `app`. */
export function setSignedInHint(app: SignedInApp, signedIn: boolean) {
  const apps = readApps();
  const has = apps.includes(app);
  if (signedIn === has) return;
  writeApps(signedIn ? [...apps, app] : apps.filter((a) => a !== app));
}
