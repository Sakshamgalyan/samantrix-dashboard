import { NextRequest, NextResponse } from "next/server";
import { MAX_BODY_BYTES, SAFE_METHODS } from "./constants";
import { isObject, type JsonObject } from "./types";

export function jsonError(status: number, message: string, extraHeaders?: HeadersInit): NextResponse {
  const response = NextResponse.json(
    { success: false, statusCode: status, error: message },
    { status, headers: extraHeaders },
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function readRequestBody(request: NextRequest): Promise<BodyInit | null> {
  if (SAFE_METHODS.has(request.method)) return null;
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > MAX_BODY_BYTES) {
    throw new Error("Payload too large");
  }
  const contentType = request.headers.get("content-type") || "";
  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("application/octet-stream")
  ) {
    return request.blob();
  }
  const text = await request.text();
  if (text && text.length > MAX_BODY_BYTES) {
    throw new Error("Payload too large");
  }
  return text || null;
}

export function parseJsonObject(text: string | null | BodyInit): JsonObject {
  if (typeof text !== "string" || !text) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
