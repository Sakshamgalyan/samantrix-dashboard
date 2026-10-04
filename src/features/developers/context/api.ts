import type React from "react";
import { api, ApiError } from "@/lib/api";
import type { DevelopersAction, DevelopersResponse } from "../types";
import { loadFailure, loadSuccess } from "./action";

/** Loads every developer account (with status counts) into context. */
export async function loadDevelopersApi(
  dispatch: React.Dispatch<DevelopersAction>,
): Promise<void> {
  try {
    dispatch(
      loadSuccess(await api.get<DevelopersResponse>("/auth/developers")),
    );
  } catch (err) {
    dispatch(
      loadFailure(
        err instanceof ApiError
          ? err.message
          : "Couldn't load developer accounts.",
      ),
    );
  }
}

/** Approve, reinstate or change role (the backend uses one endpoint for all three). */
export async function approveDeveloperApi(
  id: string,
  platformRole: string,
): Promise<void> {
  await api.patch(`/auth/developers/${id}/approve`, { platformRole });
}

/** Reject a pending request or revoke an active developer (signs them out everywhere). */
export async function rejectDeveloperApi(id: string): Promise<void> {
  await api.patch(`/auth/developers/${id}/reject`);
}
