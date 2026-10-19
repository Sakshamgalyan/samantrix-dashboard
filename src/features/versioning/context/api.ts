import type { PageQueryParams, Paginated } from "@/features/common/pagination";
import { dashboardApi, queryErrorMessage } from "@/store";
import type {
  CreateReleasePayload,
  Release,
  ReleaseListItem,
  ReleaseFormValues,
  TransitionReleasePayload,
  UpdateReleasePayload,
  WebsiteDetailsPayload,
  VersioningSummary,
} from "@/features/versioning/types";

/** Message of a failed request (an `.unwrap()` rejection or an `ApiError`), with a fallback. */
export const errorMessage = (err: unknown, fallback: string) =>
  queryErrorMessage(err, fallback);

const cleanChanges = (values: ReleaseFormValues) =>
  values.changes
    .map((c) => ({ type: c.type, text: c.text.trim() }))
    .filter((c) => c.text);

/** Body for `POST /versioning/releases`. */
export const toCreatePayload = (values: ReleaseFormValues): CreateReleasePayload => ({
  app: values.app,
  version: values.version.trim(),
  channel: values.channel,
  title: values.title.trim(),
  notes: values.notes.trim() || undefined,
  isMandatory: values.isMandatory,
  showOnHome: values.showOnHome,
  summary: values.summary.trim() || undefined,
  changes: cleanChanges(values),
  downloadUrl: values.downloadUrl.trim() || undefined,
});

/** Website fields; empty strings clear them on the backend. */
const toWebsitePayload = (values: ReleaseFormValues): WebsiteDetailsPayload => ({
  showOnHome: values.showOnHome,
  summary: values.summary.trim(),
  changes: cleanChanges(values),
  downloadUrl: values.downloadUrl.trim(),
});

/** Drafts save every field; shipped releases only their website details. */
export const toUpdatePayload = (
  release: Pick<Release, "status">,
  values: ReleaseFormValues,
): UpdateReleasePayload => {
  if (release.status !== "DRAFT") return toWebsitePayload(values);
  const { version, channel, title, isMandatory } = toCreatePayload(values);
  return {
    version,
    channel,
    title,
    isMandatory,
    // An empty string clears the notes on the backend.
    notes: values.notes.trim(),
    ...toWebsitePayload(values),
  };
}

/** Releases (paged), one release (edit dialog) and the version summary; any release change refreshes all. */
export const versioningApi = dashboardApi.injectEndpoints({
  endpoints: (build) => ({
    /** One page of releases; takes `pageParams(page, { app, channel, status })`. */
    getReleases: build.query<Paginated<ReleaseListItem>, PageQueryParams>({
      query: (params) => ({ url: "/versioning/releases", params }),
      providesTags: ["Versioning"],
    }),

    /** Full release (notes, website changes, download link) for the edit dialog. */
    getRelease: build.query<Release, string>({
      query: (id) => `/versioning/releases/${encodeURIComponent(id)}`,
      providesTags: ["Versioning"],
    }),

    /** Current versions per app/channel, rollouts, counts per status and app (KPIs, tabs, panel). */
    getVersioningSummary: build.query<VersioningSummary, void>({
      query: () => "/versioning/summary",
      providesTags: ["Versioning"],
    }),

    createRelease: build.mutation<unknown, CreateReleasePayload>({
      query: (body) => ({ url: "/versioning/releases", method: "POST", body }),
      invalidatesTags: ["Versioning"],
    }),

    /** Edits a release (also the quick "show on website" switch). */
    updateRelease: build.mutation<
      unknown,
      { id: string; body: UpdateReleasePayload | { showOnHome: boolean } }
    >({
      query: ({ id, body }) => ({ url: `/versioning/releases/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Versioning"],
    }),

    /** Rollout / release / rollback. */
    transitionRelease: build.mutation<unknown, { id: string; body: TransitionReleasePayload }>({
      query: ({ id, body }) => ({
        url: `/versioning/releases/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Versioning"],
    }),

    deleteRelease: build.mutation<unknown, string>({
      query: (id) => ({ url: `/versioning/releases/${id}`, method: "DELETE" }),
      invalidatesTags: ["Versioning"],
    }),
  }),
});

export const {
  useGetReleasesQuery,
  useGetReleaseQuery,
  useGetVersioningSummaryQuery,
  useCreateReleaseMutation,
  useUpdateReleaseMutation,
  useTransitionReleaseMutation,
  useDeleteReleaseMutation,
} = versioningApi;
