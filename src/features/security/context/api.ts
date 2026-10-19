import { dashboardApi } from "@/store";
import type { OrgSecuritySettings } from "@/types/dashboard";
import type {
  TwoFactorSetupResponse,
  TwoFactorEnableResponse,
  UpdateSecurityRequest,
} from "@/features/security/types/api";

export type {
  TwoFactorSetupResponse,
  TwoFactorEnableResponse,
  UpdateSecurityRequest,
};

/** `GET /organizations/current/security` as the backend sends it. */
interface RawSecurityPolicies {
  enforce2FA?: boolean;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  allowedDomains?: unknown;
}

/** Organization security policies, plus the signed-in user's own two-factor setup. */
export const securityApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** The backend returns `{ enforce2FA, sessionTimeoutMinutes, passwordMinLength, allowedDomains }`. */
    getOrgSecurity: build.query<OrgSecuritySettings | null, void>({
      query: () => "/organizations/current/security",
      transformResponse: (res: RawSecurityPolicies | null) =>
        res
          ? {
              requireTwoFactor: Boolean(res.enforce2FA),
              sessionTimeoutMinutes: res.sessionTimeoutMinutes,
              passwordMinLength: res.passwordMinLength,
              allowedEmailDomains: Array.isArray(res.allowedDomains) ? res.allowedDomains : [],
            }
          : null,
      providesTags: ["Security"],
    }),

    updateOrgSecurity: build.mutation<void, UpdateSecurityRequest>({
      // Mapped to the backend DTO names; password expiry is not stored by the backend yet
      query: (body) => ({
        url: "/organizations/current/security",
        method: "PATCH",
        body: {
          enforce2FA: body.requireTwoFactor,
          sessionTimeoutMinutes: body.sessionTimeoutMinutes,
          passwordMinLength: body.passwordMinLength,
          allowedDomains: body.allowedEmailDomains,
        },
      }),
      invalidatesTags: ["Security"],
    }),

    /** Starts authenticator setup: a fresh secret and QR code (nothing is cached). */
    setupTwoFactor: build.mutation<TwoFactorSetupResponse | null, void>({
      query: () => ({ url: "/auth/2fa/setup", method: "POST" }),
    }),

    enableTwoFactor: build.mutation<TwoFactorEnableResponse | null, { secret: string; code: string }>({
      query: (body) => ({ url: "/auth/2fa/enable", method: "POST", body }),
      // The account profile shows the two-factor status
      invalidatesTags: ["Account"],
    }),

    disableTwoFactor: build.mutation<void, { password: string }>({
      query: (body) => ({ url: "/auth/2fa/disable", method: "POST", body }),
      invalidatesTags: ["Account"],
    }),
  }),
});

export const {
  useGetOrgSecurityQuery,
  useUpdateOrgSecurityMutation,
  useSetupTwoFactorMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
} = securityApi;
