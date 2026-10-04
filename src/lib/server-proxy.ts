import { NextRequest, NextResponse } from "next/server";

const INTERNAL_BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5000";

const GATEWAY_SECRET =
  process.env.GATEWAY_SECRET || "samantrix-internal-bff-secret-key";

// Headers that should never be forwarded upstream or downstream
const DISALLOWED_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-length",
  "server",
  "x-powered-by",
]);

export async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const joinedPath = pathSegments.join("/");

    // Extract search query
    const url = new URL(request.url);
    const search = url.search;

    // Backend target endpoint
    const backendTarget = `${INTERNAL_BACKEND_URL.replace(/\/+$/, "")}/api/v1/${joinedPath}${search}`;

    // Prepare headers to forward
    const forwardHeaders: Record<string, string> = {
      "x-samantrix-gateway-secret": GATEWAY_SECRET,
      "x-forwarded-for":
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "127.0.0.1",
      "x-forwarded-host": request.headers.get("host") || "localhost",
      "x-forwarded-proto": url.protocol.replace(":", ""),
    };

    // Forward client headers including Authorization Bearer token
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        !DISALLOWED_HEADERS.has(lowerKey) &&
        !lowerKey.startsWith("x-samantrix-")
      ) {
        forwardHeaders[key] = value;
      }
    });

    // If Authorization header wasn't sent explicitly, extract token from cookies
    const cookieToken = request.cookies.get("samantrix_access_token")?.value;
    if (cookieToken && !forwardHeaders["authorization"]) {
      forwardHeaders["authorization"] = `Bearer ${cookieToken}`;
    }

    // Extract body for mutating methods
    let body: BodyInit | null = null;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const text = await request.text();
        if (text) body = text;
      } else if (
        contentType.includes("multipart/form-data") ||
        contentType.includes("application/x-www-form-urlencoded")
      ) {
        body = await request.blob();
      } else {
        const text = await request.text();
        if (text) body = text;
      }
    }

    const response = await fetch(backendTarget, {
      method: request.method,
      headers: forwardHeaders,
      body,
      cache: "no-store",
    });

    // Prepare clean response headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!DISALLOWED_HEADERS.has(lowerKey)) {
        responseHeaders.set(key, value);
      }
    });

    // Explicit security headers on the proxied response
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("X-Frame-Options", "SAMEORIGIN");

    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Gateway Error";
    console.error(`[Samantrix Dashboard BFF Proxy Error]:`, errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: "Service unavailable",
        message: "Unable to connect to internal services.",
      },
      { status: 503 },
    );
  }
}
