import cors from "cors";
import express from "express";
import {
  archiveNote,
  buildDashboard,
  createNote,
  getNote,
  listAssets,
  listNotes,
  listTemplates,
  listWorkshopPresets,
  readDatabase,
  restoreNote,
  toggleFavorite,
  updateNote,
} from "./store.js";
import type {
  AssetListQuery,
  CreateNoteInput,
  NoteListQuery,
  TemplateListQuery,
  UpdateNoteInput,
  WorkshopPresetListQuery,
} from "./types.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json());

const readString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const readBoolean = (value: unknown): boolean | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
};

const readPositiveInt = (value: unknown): number | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "litenote-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/dashboard", async (_request, response) => {
  const db = await readDatabase();
  response.json(buildDashboard(db));
});

app.get("/api/notes", async (request, response) => {
  const query: NoteListQuery = {
    query: readString(request.query.query),
    status:
      request.query.status === "draft" || request.query.status === "published"
        ? request.query.status
        : undefined,
    favorite: readBoolean(request.query.favorite),
    archived: readBoolean(request.query.archived),
    tag: readString(request.query.tag),
    templateId: readString(request.query.templateId),
    page: readPositiveInt(request.query.page),
    limit: readPositiveInt(request.query.limit),
  };

  response.json(await listNotes(query));
});

app.get("/api/notes/:id", async (request, response) => {
  const note = await getNote(request.params.id);

  if (!note) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.json(note);
});

app.post("/api/notes", async (request, response) => {
  const payload = request.body as CreateNoteInput;
  const note = await createNote(payload);
  response.status(201).json(note);
});

app.patch("/api/notes/:id", async (request, response) => {
  const payload = request.body as UpdateNoteInput;
  const note = await updateNote(request.params.id, payload);

  if (!note) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.json(note);
});

app.post("/api/notes/:id/favorite", async (request, response) => {
  const note = await toggleFavorite(request.params.id);

  if (!note) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.json(note);
});

app.post("/api/notes/:id/archive", async (request, response) => {
  const note = await archiveNote(request.params.id);

  if (!note) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.json(note);
});

app.post("/api/notes/:id/restore", async (request, response) => {
  const note = await restoreNote(request.params.id);

  if (!note) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.json(note);
});

app.get("/api/templates", async (request, response) => {
  const query: TemplateListQuery = {
    featured: readBoolean(request.query.featured),
    limit: readPositiveInt(request.query.limit),
  };

  response.json(await listTemplates(query));
});

app.get("/api/assets", async (request, response) => {
  const query: AssetListQuery = {
    category: readString(request.query.category),
    query: readString(request.query.query),
    page: readPositiveInt(request.query.page),
    limit: readPositiveInt(request.query.limit),
  };

  response.json(await listAssets(query));
});

app.get("/api/workshop-presets", async (request, response) => {
  const query: WorkshopPresetListQuery = {
    limit: readPositiveInt(request.query.limit),
  };

  response.json(await listWorkshopPresets(query));
});

app.listen(port, () => {
  console.log(`LiteNote API listening on http://localhost:${port}`);
});
