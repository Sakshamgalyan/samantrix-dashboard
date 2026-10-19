"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  api,
  ApiError,
  AUTH_UNAUTHORIZED_EVENT,
  BACKEND_UNAVAILABLE_EVENT,
  BACKEND_RECONNECTED_EVENT,
  isBackendDownError,
  checkBackendHealth,
  getCachedBackendOfflineState,
  setCachedBackendOfflineState,
  clearCachedBackendOfflineState,
  isAuthenticatedResponse,
} from "@/lib/api-client/apiClient";
import { getHomePath } from "@/utils/home-path";
import { broadcastAuthLogout } from "@/utils/broadcast-auth-logout";
import { setSignedInHint } from "@/utils/signed-in-hint";
import { useAuthBroadcast } from "@/hooks/use-auth-broadcast";
import { dashboardApi, useAppDispatch } from "@/store";
import {
  Organization,
  OrgRole,
} from "@/types/dashboard";

export interface BackendErrorInfo {
  message: string;
  statusCode?: number;
  timestamp: number;
}

/** Where the website (simantrix-home) sends the browser with a one-time sign-in code. */
export const HANDOFF_CALLBACK_PATH = "/auth/callback";

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
  backendError: BackendErrorInfo | null;
  isBackendDown: boolean;
  retryConnection: () => Promise<boolean>;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const storeDispatch = useAppDispatch();

  const [user, setUser] = useState<CurrentUserSession | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<BackendErrorInfo | null>(() => {
    const cached = getCachedBackendOfflineState();
    if (cached) {
      return {
        message: cached.message,
        statusCode: cached.statusCode,
        timestamp: cached.timestamp,
      };
    }
    return null;
  });
  const isBackendDown = Boolean(backendError);

  // The cookies are httpOnly; the BFF clears them on logout or once a refresh is refused
  const clearLocalSession = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setOrganization(null);
    storeDispatch(dashboardApi.util.resetApiState());
    router.push("/");
  }, [router, storeDispatch]);

  // Synchronize logout across all open browser tabs
  useAuthBroadcast(clearLocalSession);

  // Lets the public website show "Go to dashboard" instead of "Sign in" (no token in the cookie)
  useEffect(() => {
    if (!isLoading) setSignedInHint("DASHBOARD", isAuthenticated);
  }, [isLoading, isAuthenticated]);

  // Listen to global backend unavailable / reconnected events dispatched by the API client
  useEffect(() => {
    const handleUnavailable = (event: Event) => {
      const custom = event as CustomEvent<{ message?: string; status?: number }>;
      const errInfo = {
        message: custom.detail?.message || "Unable to connect to internal services.",
        statusCode: custom.detail?.status || 503,
        timestamp: Date.now(),
      };
      setCachedBackendOfflineState(errInfo);
      setBackendError(errInfo);
    };

    const handleReconnected = () => {
      clearCachedBackendOfflineState();
      setBackendError(null);
    };

    window.addEventListener(BACKEND_UNAVAILABLE_EVENT, handleUnavailable);
    window.addEventListener(BACKEND_RECONNECTED_EVENT, handleReconnected);
    return () => {
      window.removeEventListener(BACKEND_UNAVAILABLE_EVENT, handleUnavailable);
      window.removeEventListener(BACKEND_RECONNECTED_EVENT, handleReconnected);
    };
  }, []);

  // The api client could not renew the session: drop the user (AuthGate then goes to sign-in)
  useEffect(() => {
    const handleUnauthorized = () => {
      broadcastAuthLogout();
      clearLocalSession();
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [clearLocalSession]);

  // Cached server data belongs to whoever was signed in: drop it when the account changes
  const cachedForUserRef = useRef<string | null>(null);
  const userId = user?.id ?? null;
  useEffect(() => {
    if (cachedForUserRef.current !== userId) {
      if (cachedForUserRef.current !== null) storeDispatch(dashboardApi.util.resetApiState());
      cachedForUserRef.current = userId;
    }
  }, [userId, storeDispatch]);

  // Concurrent callers (mount effect, login, portal choice) share one profile request
  const sessionInFlightRef = useRef<Promise<CurrentUserSession | null> | null>(null);

  const loadSession = useCallback(async (): Promise<CurrentUserSession | null> => {
    try {
      // The session is in httpOnly cookies: ask the backend who we are. On a 401 the api
      // client renews the session once and retries; if that fails too we are anonymous.
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
        clearCachedBackendOfflineState();
        setBackendError(null);

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
      clearCachedBackendOfflineState();
      setBackendError(null);
      setIsAuthenticated(false);
      setUser(null);
      setOrganization(null);
      return null;
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        clearCachedBackendOfflineState();
        setBackendError(null);
        setIsAuthenticated(false);
        setUser(null);
        setOrganization(null);
        return null;
      }

      if (isBackendDownError(err)) {
        console.warn("[Simantrix Auth] Backend service unreachable:", err);
        const errInfo = {
          message:
            err instanceof Error
              ? err.message
              : "Unable to connect to internal services.",
          statusCode: err instanceof ApiError ? err.statusCode : 503,
          timestamp: Date.now(),
        };
        setCachedBackendOfflineState(errInfo);
        setBackendError(errInfo);
        setIsAuthenticated(false);
        return null;
      }

      console.warn("Could not restore session from backend:", err);
      setIsAuthenticated(false);
      setUser(null);
      setOrganization(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSession = useCallback((): Promise<CurrentUserSession | null> => {
    if (!sessionInFlightRef.current) {
      sessionInFlightRef.current = loadSession().finally(() => {
        sessionInFlightRef.current = null;
      });
    }
    return sessionInFlightRef.current;
  }, [loadSession]);

  const retryConnection = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const health = await checkBackendHealth();
      if (health.isOnline) {
        setBackendError(null);
        const session = await loadSession();
        return Boolean(session);
      }
      setBackendError({
        message: health.message || "Backend service is currently unavailable.",
        statusCode: health.status || 503,
        timestamp: Date.now(),
      });
      return false;
    } catch (err) {
      setBackendError({
        message: err instanceof Error ? err.message : "Backend unreachable",
        statusCode: 503,
        timestamp: Date.now(),
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadSession]);

  useEffect(() => {
    // The website handoff page signs in with a fresh code and then calls refreshSession() itself.
    // Restoring an older session here would race it (its socket would get `session:revoked` once
    // the exchange moves the session, which clears the new tokens and redirects to `/`).
    if (window.location.pathname === HANDOFF_CALLBACK_PATH) return;
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

      if (isAuthenticatedResponse(response)) {
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

      if (isAuthenticatedResponse(response)) {
        router.push(getHomePath(await fetchSession()));
        return { success: true };
      }

      return { success: false, error: "Invalid two-factor code" };
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid two-factor code or recovery code";
      return { success: false, error: msg };
    }
  };



  const logout = useCallback(async () => {
    // Free this device's slot so the account can sign in elsewhere
    try {
      // The BFF adds the refresh cookie and clears both session cookies whatever the answer
      await api.post("/auth/logout");
    } catch {
      // Token already expired or revoked: the session is over either way
    }
    broadcastAuthLogout();
    clearLocalSession();
  }, [clearLocalSession]);

  const isSuperAdmin = user?.platformRole === "SUPERADMIN";
  const isOwner = user?.role === "OWNER" || isSuperAdmin;
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
        backendError,
        isBackendDown,
        retryConnection,
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
