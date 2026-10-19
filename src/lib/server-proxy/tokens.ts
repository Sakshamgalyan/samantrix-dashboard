import { TOKEN_FIELDS } from "./constants";
import { isObject } from "./types";

/**
 * Pulls `accessToken` / `refreshToken` out of the backend envelope (`data` or `data.tokens`)
 * and deletes every token field, marking the payload `authenticated: true` instead.
 */
export function extractTokens(body: unknown): { accessToken?: string; refreshToken?: string } | null {
  if (!isObject(body)) return null;
  const data = isObject(body.data) ? body.data : body;
  const tokens = isObject(data.tokens) ? data.tokens : null;

  const accessToken =
    (typeof tokens?.accessToken === "string" && tokens.accessToken) ||
    (typeof data.accessToken === "string" && data.accessToken) ||
    undefined;
  const refreshToken =
    (typeof tokens?.refreshToken === "string" && tokens.refreshToken) ||
    (typeof data.refreshToken === "string" && data.refreshToken) ||
    undefined;
  if (!accessToken && !refreshToken) return null;

  for (const field of TOKEN_FIELDS) {
    if (field === "tokens" && !tokens) continue;
    delete data[field];
  }
  data.authenticated = true;
  return { accessToken, refreshToken };
}
