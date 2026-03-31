import type { DashboardResponse, Note, NoteDraft } from "./types";

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

const draftToPayload = (draft: NoteDraft) => ({
  title: draft.title,
  body: draft.body,
  tags: draft.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
  mood: draft.mood,
  templateId: draft.templateId,
  status: draft.status,
});

export const fetchDashboard = () => requestJson<DashboardResponse>("/dashboard");

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
