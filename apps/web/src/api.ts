import type {
  Asset,
  DashboardResponse,
  Note,
  NoteDraft,
  NoteSummary,
  Template,
  WorkshopPreset,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function withQuery(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) {
    return path;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

const draftToPayload = (draft: NoteDraft) => ({
  title: draft.title,
  body: draft.body,
  tags: draft.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
  mood: draft.mood,
  templateId: draft.templateId,
  coverImage: draft.coverImage,
  status: draft.status,
});

export const fetchDashboard = () => requestJson<DashboardResponse>("/dashboard");

export const fetchNotes = (params?: {
  query?: string;
  status?: Note["status"];
  favorite?: boolean;
  archived?: boolean;
  tag?: string;
  templateId?: string;
  page?: number;
  limit?: number;
}) =>
  requestJson<NoteSummary[]>(
    withQuery("/notes", {
      query: params?.query,
      status: params?.status,
      favorite: params?.favorite,
      archived: params?.archived,
      tag: params?.tag,
      templateId: params?.templateId,
      page: params?.page,
      limit: params?.limit,
    }),
  );

export const fetchNote = (id: string) => requestJson<Note>(`/notes/${id}`);

export const fetchTemplates = (params?: {
  featured?: boolean;
  limit?: number;
}) =>
  requestJson<Template[]>(
    withQuery("/templates", {
      featured: params?.featured,
      limit: params?.limit,
    }),
  );

export const fetchAssets = (params?: {
  category?: string;
  query?: string;
  page?: number;
  limit?: number;
}) =>
  requestJson<Asset[]>(
    withQuery("/assets", {
      category: params?.category,
      query: params?.query,
      page: params?.page,
      limit: params?.limit,
    }),
  );

export const fetchWorkshopPresets = (params?: { limit?: number }) =>
  requestJson<WorkshopPreset[]>(
    withQuery("/workshop-presets", {
      limit: params?.limit,
    }),
  );

export const createNote = (draft?: Partial<NoteDraft>) =>
  requestJson<Note>("/notes", {
    method: "POST",
    body: JSON.stringify(
      draft
        ? draftToPayload({
            title: draft.title ?? "Untitled entry",
            body: draft.body ?? "",
            tags: draft.tags ?? "",
            mood: draft.mood ?? "calm",
            templateId: draft.templateId ?? "botanical-reflection",
            coverImage: draft.coverImage ?? "",
            status: draft.status ?? "draft",
          })
        : {},
    ),
  });

export const updateNote = (id: string, draft: NoteDraft) =>
  requestJson<Note>(`/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(draftToPayload(draft)),
  });

export const toggleFavorite = (id: string) =>
  requestJson<Note>(`/notes/${id}/favorite`, {
    method: "POST",
  });

export const archiveNote = (id: string) =>
  requestJson<Note>(`/notes/${id}/archive`, {
    method: "POST",
  });

export const restoreNote = (id: string) =>
  requestJson<Note>(`/notes/${id}/restore`, {
    method: "POST",
  });
