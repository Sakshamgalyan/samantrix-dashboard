import { ApiError } from "@/lib/api-client/apiClient";
import { dashboardApi, queryErrorMessage } from "@/store";

export interface AccountProfile {
  email: string;
  fullName: string;
  phone: string | null;
  timezone: string | null;
  avatarUrl: string | null;
  userType: "DEVELOPER" | "ORGANIZATION";
  platformRole: string;
  twoFactorEnabled: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  timezone?: string;
  avatarUrl?: string | null;
}

export interface PasswordCodeResult {
  email: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

export interface AccountSession {
  id: string;
  deviceName: string | null;
  ipAddress: string | null;
  isCurrent: boolean;
  loginAt: string;
  lastSeenAt: string;
}

/** The signed-in user's own account (`/account/*`) and signed-in devices (`/login-history/*`). */
export const accountApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    getAccountProfile: build.query<AccountProfile, void>({
      query: () => "/account/profile",
      providesTags: ["Account"],
    }),

    updateAccountProfile: build.mutation<AccountProfile, UpdateProfilePayload>({
      query: (body) => ({ url: "/account/profile", method: "PATCH", body }),
      // The response is the saved profile: put it in the cache instead of refetching
      async onQueryStarted(_payload, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data)
            dispatch(
              accountApi.util.upsertQueryData(
                "getAccountProfile",
                undefined,
                data,
              ),
            );
        } catch {
          // The caller shows the error
        }
      },
    }),

    /** Emails a 6-digit code to the signed-in user's own address. */
    requestPasswordCode: build.mutation<PasswordCodeResult, void>({
      query: () => ({ url: "/account/password/otp", method: "POST" }),
    }),

    /** Changes the password; other devices are signed out. */
    changePassword: build.mutation<
      { success: boolean; signedOutSessions: number },
      { code: string; currentPassword?: string; newPassword: string }
    >({
      query: (body) => ({ url: "/account/password", method: "POST", body }),
      invalidatesTags: ["Sessions"],
    }),

    getActiveSessions: build.query<AccountSession[], void>({
      query: () => "/login-history/active",
      providesTags: ["Sessions"],
    }),

    revokeSession: build.mutation<void, string>({
      query: (id) => ({
        url: `/login-history/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sessions"],
    }),

    getUploadUrl: build.mutation<
      { uploadUrl: string; fileUrl: string; key: string },
      { fileName: string; contentType: string; folder?: string }
    >({
      query: (body) => ({ url: "/files/upload-url", method: "POST", body }),
    }),
  }),
});

export const {
  useGetAccountProfileQuery,
  useUpdateAccountProfileMutation,
  useRequestPasswordCodeMutation,
  useChangePasswordMutation,
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useGetUploadUrlMutation,
} = accountApi;

export const uploadFileToStorage = async (
  uploadUrl: string,
  file: File,
  contentType?: string,
): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType || file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload to storage provider failed (${response.status})`);
  }
};

export const errorMessage = (err: unknown, fallback: string): string => {
  return queryErrorMessage(err, fallback);
};

/** Seconds to wait from a 429 cooldown response, if the server sent one. */
export const retryAfterSeconds = (err: unknown): number | null => {
  if (!err || typeof err !== "object") return null;
  const status =
    err instanceof ApiError
      ? err.statusCode
      : (err as { status?: unknown }).status;
  if (status !== 429) return null;
  const data = (err as { data?: { error?: { retryAfterSeconds?: unknown } } })
    .data;
  const seconds = data?.error?.retryAfterSeconds;
  return typeof seconds === "number" ? seconds : null;
};
