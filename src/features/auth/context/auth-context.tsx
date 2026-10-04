"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  api,
  ApiError,
  getStoredToken,
  getStoredRefreshToken,
  setStoredToken,
  clearStoredToken,
} from "@/lib/api";
import { getHomePath } from "@/lib/home-path";
import {
  Organization,
  OrgRole,
} from "@/types/dashboard";

/** Console a session was opened in; developers choose it right after signing in. */
export type LoginPortal = "DEVELOPER" | "ORGANIZATION";

export interface CurrentUserSession {
  id: string;
  name: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  avatar?: string;
  role: OrgRole | string;
  platformRole?: string;
  userType?: "DEVELOPER" | "ORGANIZATION";
  twoFactorEnabled: boolean;
  isEmailVerified: boolean;
  permissions: string[];
  organization: {
    id: string;
    name: string;
    slug: string;
    status?: string;
    planTier?: string;
    role?: string;
  } | null;
  /** The login session behind the current token (one active device per user). */
  session: {
    id: string;
    deviceId: string;
    loginAs: LoginPortal | null;
    loginAt: string;
    requiresPortalSelection: boolean;
  } | null;
}

export interface AuthContextType {
  user: CurrentUserSession | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    requires2FA?: boolean;
    tempToken?: string;
    error?: string;
  }>;
  verify2FA: (
    tempToken: string,
    code: string,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Ends this device's session on the backend, then clears local state. */
  logout: () => Promise<void>;
  /** Clears local state only: for when the backend already ended the session. */
  clearLocalSession: () => void;
  /** Reloads the session from the backend; resolves with the signed-in user (or null). */
  refreshSession: () => Promise<CurrentUserSession | null>;
  isOwner: boolean;
  isAdmin: boolean;
  isManagerOrHigher: boolean;
  canManageTeam: boolean;
  canManageBilling: boolean;
  canManageSecurity: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUserSession | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSession = useCallback(async (): Promise<CurrentUserSession | null> => {
    try {
      const token = getStoredToken();

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setOrganization(null);
        setIsLoading(false);
        return null;
      }

      // Fetch user identity
      const profile = await api.get("/auth/profile");
      if (profile && profile.id) {
        const userObj: CurrentUserSession = {
          id: profile.id,
          name: profile.fullName || profile.name || "User",
          fullName: profile.fullName || profile.name || "User",
          email: profile.email,
          avatarUrl: profile.avatarUrl || profile.avatar,
          avatar: profile.avatarUrl || profile.avatar,
          role: profile.role || "MEMBER",
          platformRole: profile.platformRole,
          userType: profile.userType,
          twoFactorEnabled: profile.twoFactorEnabled ?? false,
          isEmailVerified: profile.isEmailVerified ?? false,
          permissions: profile.permissions || ["*"],
          organization: profile.organization || null,
          session: profile.session || null,
        };

        setUser(userObj);
        setIsAuthenticated(true);

        // Fetch organization details if available
        if (profile.organization?.id) {
          try {
            const orgData = await api.get("/organizations/current");
            if (orgData && orgData.id) {
              setOrganization(orgData);
            }
          } catch {
            // Organization endpoint might fail if token lacks orgId
          }
        }
        return userObj;
      }
      setIsAuthenticated(false);
      setUser(null);
      setOrganization(null);
      return null;
    } catch (err) {
      console.warn("Could not restore session from backend:", err);
      // Clean up invalid tokens
      clearStoredToken();
      setIsAuthenticated(false);
      setUser(null);
      setOrganization(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchSession);
  }, [fetchSession]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    requires2FA?: boolean;
    tempToken?: string;
    error?: string;
  }> => {
    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response && response.requires2FA) {
        return {
          success: false,
          requires2FA: true,
          tempToken: response.tempToken,
        };
      }

      if (response && response.accessToken) {
        setStoredToken(response.accessToken, response.refreshToken);

        router.push(getHomePath(await fetchSession()));
        return { success: true };
      }

      return { success: false, error: "Authentication failed. Invalid response." };
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to sign in. Check email and password.";
      return { success: false, error: msg };
    }
  };

  const verify2FA = async (
    tempToken: string,
    code: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post("/auth/2fa/verify", {
        tempToken,
        code: code.trim(),
      });

      if (response && response.accessToken) {
        setStoredToken(response.accessToken, response.refreshToken);

        router.push(getHomePath(await fetchSession()));
        return { success: true };
      }

      return { success: false, error: "Invalid two-factor code" };
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid two-factor code or recovery code";
      return { success: false, error: msg };
    }
  };

  const clearLocalSession = useCallback(() => {
    clearStoredToken();
    setIsAuthenticated(false);
    setUser(null);
    setOrganization(null);
    router.push("/");
  }, [router]);

  const logout = useCallback(async () => {
    // Free this device's slot so the account can sign in elsewhere
    try {
      const refreshToken = getStoredRefreshToken();
      await api.post("/auth/logout", refreshToken ? { refreshToken } : undefined);
    } catch {
      // Token already expired or revoked: the session is over either way
    }
    clearLocalSession();
  }, [clearLocalSession]);

  const isOwner = user?.role === "OWNER";
  const isAdmin = user?.role === "ADMIN" || isOwner;
  const isManagerOrHigher = user?.role === "MANAGER" || isAdmin;
  const canManageTeam = isAdmin;
  const canManageBilling = isOwner || isAdmin;
  const canManageSecurity = isOwner || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated,
        isLoading,
        login,
        verify2FA,
        logout,
        clearLocalSession,
        refreshSession: fetchSession,
        isOwner,
        isAdmin,
        isManagerOrHigher,
        canManageTeam,
        canManageBilling,
        canManageSecurity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
