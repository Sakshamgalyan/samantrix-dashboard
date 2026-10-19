export const AUTH_BROADCAST_CHANNEL = "simantrix_auth_channel";
export const AUTH_LOGOUT_STORAGE_KEY = "simantrix_auth_logout_timestamp";

export interface AuthBroadcastMessage {
  type: "LOGOUT";
  timestamp: number;
}

/** Broadcasts a logout event across all browser tabs via BroadcastChannel and localStorage. */
export const broadcastAuthLogout = (): void => {
  if (typeof window === "undefined") return;

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
      channel.postMessage({ type: "LOGOUT", timestamp: Date.now() } satisfies AuthBroadcastMessage);
      channel.close();
    }
  } catch (err) {
    console.warn("[AuthBroadcast] BroadcastChannel post error:", err);
  }

  try {
    window.localStorage.setItem(AUTH_LOGOUT_STORAGE_KEY, Date.now().toString());
  } catch {
    // Storage might be restricted or unavailable
  }
};
