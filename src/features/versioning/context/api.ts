import type React from "react";
import { api, ApiError } from "@/lib/api";
import type {
  CreateReleasePayload,
  Release,
  ReleaseFormValues,
  TransitionReleasePayload,
  UpdateReleasePayload,
  VersioningAction,
  VersioningSummary,
} from "../types";
import { loadFailure, loadSuccess, setSubmitting } from "./action";

export const errorMessage = (err: unknown, fallback: string) =>
  err instanceof ApiError ? err.message : fallback;

/** Loads every release (filtered client-side so tab counts stay right) plus the summary. */
export async function fetchVersioningApi(
  dispatch: React.Dispatch<VersioningAction>,
): Promise<void> {
  try {
    const [releases, summary] = await Promise.all([
      api.get<Release[]>("/versioning/releases"),
      api.get<VersioningSummary>("/versioning/summary"),
    ]);
    dispatch(loadSuccess(releases, summary));
  } catch (err) {
    dispatch(loadFailure(errorMessage(err, "Couldn't load releases.")));
  }
}

/** Runs a mutation with the submitting flag set; resolves to null on success or the error message. */
async function mutate(
  dispatch: React.Dispatch<VersioningAction>,
  request: () => Promise<unknown>,
  fallback: string,
): Promise<string | null> {
  dispatch(setSubmitting(true));
  try {
    await request();
    return null;
  } catch (err) {
    return errorMessage(err, fallback);
  } finally {
    dispatch(setSubmitting(false));
  }
}

const toPayload = (values: ReleaseFormValues): CreateReleasePayload => ({
  app: values.app,
  version: values.version.trim(),
  channel: values.channel,
  title: values.title.trim(),
  notes: values.notes.trim() || undefined,
  isMandatory: values.isMandatory,
});

export function createReleaseApi(
  values: ReleaseFormValues,
  dispatch: React.Dispatch<VersioningAction>,
) {
  return mutate(
    dispatch,
    () => api.post("/versioning/releases", toPayload(values)),
    "Couldn't create the release.",
  );
}

export function updateReleaseApi(
  id: string,
  values: ReleaseFormValues,
  dispatch: React.Dispatch<VersioningAction>,
) {
  const { version, channel, title, isMandatory } = toPayload(values);
  // An empty string clears the notes on the backend.
  const payload: UpdateReleasePayload = {
    version,
    channel,
    title,
    isMandatory,
    notes: values.notes.trim(),
  };
  return mutate(
    dispatch,
    () => api.patch(`/versioning/releases/${id}`, payload),
    "Couldn't save the release.",
  );
}

export function transitionReleaseApi(
  id: string,
  payload: TransitionReleasePayload,
  dispatch: React.Dispatch<VersioningAction>,
) {
  return mutate(
    dispatch,
    () => api.patch(`/versioning/releases/${id}/status`, payload),
    "Couldn't update the release status.",
  );
}

export function deleteReleaseApi(
  id: string,
  dispatch: React.Dispatch<VersioningAction>,
) {
  return mutate(
    dispatch,
    () => api.delete(`/versioning/releases/${id}`),
    "Couldn't delete the release.",
  );
}
