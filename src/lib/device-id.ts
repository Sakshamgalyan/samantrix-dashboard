const DEVICE_KEY = "samantrix_device_id";

let memoryDeviceId: string | null = null;

/**
 * Stable id for this browser/install, sent as `x-device-id`. The backend allows one
 * signed-in device per user and uses this to tell devices apart.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // Storage unavailable (private mode): keep one id for this page's lifetime
    memoryDeviceId ??= crypto.randomUUID();
    return memoryDeviceId;
  }
}
