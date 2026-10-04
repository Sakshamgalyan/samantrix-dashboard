import type React from "react";
import { api, ApiError } from "@/lib/api";
import type {
  CreateSettingPayload,
  PlatformSetting,
  PlatformSettingsResponse,
  RemoveSettingResult,
  SettingsAction,
  UpdateSettingPayload,
} from "../types";
import { loadFailure, loadStart, loadSuccess } from "./action";

const settingPath = (key: string) =>
  `/platform-settings/${encodeURIComponent(key)}`;

export function getApiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

/** Loads every setting (built-in defaults included, secrets masked) into context. */
export async function fetchSettingsApi(
  dispatch: React.Dispatch<SettingsAction>,
  background: boolean,
): Promise<void> {
  dispatch(loadStart(background));
  try {
    const data = await api.get<PlatformSettingsResponse>("/platform-settings");
    dispatch(loadSuccess(data, new Date().toISOString()));
  } catch (err) {
    dispatch(
      loadFailure(getApiErrorMessage(err, "Could not load platform settings.")),
    );
  }
}

export function createSettingApi(
  payload: CreateSettingPayload,
): Promise<PlatformSetting> {
  return api.post<PlatformSetting>("/platform-settings", payload);
}

export function updateSettingApi(
  key: string,
  payload: UpdateSettingPayload,
): Promise<PlatformSetting> {
  return api.patch<PlatformSetting>(settingPath(key), payload);
}

/** Deletes a custom setting, or resets a built-in one to its default. */
export function removeSettingApi(key: string): Promise<RemoveSettingResult> {
  return api.delete<RemoveSettingResult>(settingPath(key));
}
