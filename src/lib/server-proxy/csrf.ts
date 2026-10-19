import { NextRequest } from "next/server";
import { SAFE_METHODS } from "./constants";
import { publicOrigin } from "./cookies";

/** Rejects cross-site writes: a custom header forces a CORS preflight, and Origin must be ours. */
export function csrfFailure(request: NextRequest): string | null {
  if (SAFE_METHODS.has(request.method)) return null;
  if (!request.headers.get("x-device-id")) return "Missing x-device-id header";
  const origin = request.headers.get("origin");
  if (origin && origin !== publicOrigin(request).origin && origin !== request.nextUrl.origin) {
    return "Cross-origin request rejected";
  }
  return null;
}
