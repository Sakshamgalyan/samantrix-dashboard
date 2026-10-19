import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export const REQUEST_TIMEOUT_MS = 30_000;

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode?: number;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  /** HTTP status; 408 when the request timed out, 0 when no response arrived or it was cancelled. */
  statusCode: number;
  /** Parsed response body, when there was one. */
  data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

/** Per-call options (all optional): extra headers, query params, an AbortSignal, or a different timeout. */
export type ApiRequestOptions = Pick<
  AxiosRequestConfig,
  "headers" | "params" | "signal" | "timeout"
>;

export type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Fired when the session is gone (refresh failed); the auth context drops the signed-in user. */
export const AUTH_UNAUTHORIZED_EVENT = "Simantrix:auth:unauthorized";

/** Fired when the backend server is unreachable or returning 502/503/504 errors. */
export const BACKEND_UNAVAILABLE_EVENT = "Simantrix:backend:unavailable";

/** Fired when communication with the central backend server is successfully restored. */
export const BACKEND_RECONNECTED_EVENT = "Simantrix:backend:reconnected";
