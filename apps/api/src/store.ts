import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSeedDatabase } from "./data.js";
import type {
  CreateNoteInput,
  DatabaseShape,
  DashboardResponse,
  Note,
  UpdateNoteInput,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const databasePath = path.resolve(dataDir, "litenote-db.json");

const summarize = (body: string): string => {
  const compact = body.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "Capture an idea, a plan, or a fragment before it slips away.";
  }
  return compact.length > 88 ? `${compact.slice(0, 85)}...` : compact;
};

const createId = (): string =>
  `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const sortNotes = (notes: Note[]) =>
  [...notes].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

const writeDatabase = async (db: DatabaseShape) => {
  await mkdir(dataDir, { recursive: true });
  await writeFile(databasePath, JSON.stringify(db, null, 2), "utf8");
};

export const readDatabase = async (): Promise<DatabaseShape> => {
  try {
    const content = await readFile(databasePath, "utf8");
    return JSON.parse(content) as DatabaseShape;
  } catch {
    const seeded = createSeedDatabase();
    await writeDatabase(seeded);
    return seeded;
  }
};

export const buildDashboard = (db: DatabaseShape): DashboardResponse => {
  const notes = sortNotes(db.notes).filter((note) => !note.isArchived);
  const spotlightTemplate =
    db.templates.find((template) => template.featured) ?? db.templates[0];

  return {
    user: {
      name: "Studio Owner",
      role: "Editor in residence",
      syncState: "Local sync active",
    },
    spotlight: {
      title: spotlightTemplate.name,
      summary: spotlightTemplate.summary,
      image: spotlightTemplate.previewImage,
      author: "Curated by LiteNote",
    },
    writingTip:
      "Start with a sensory detail first, then capture the decision or feeling that followed it.",
    stats: {
      totalNotes: notes.length,
      publishedNotes: notes.filter((note) => note.status === "published").length,
      favoriteNotes: notes.filter((note) => note.isFavorite).length,
      templates: db.templates.length,
      assets: db.assets.length,
    },
    notes,
    templates: db.templates,
    assets: db.assets,
    workshopPresets: db.workshopPresets,
  };
};

export const createNote = async (input: CreateNoteInput): Promise<Note> => {
  const db = await readDatabase();
  const now = new Date().toISOString();

  const note: Note = {
    id: createId(),
    title: input.title?.trim() || "Untitled entry",
    body: input.body?.trim() || "",
    summary: summarize(input.body ?? ""),
    tags: input.tags ?? [],
    mood: input.mood ?? "calm",
    templateId: input.templateId ?? db.templates[0]?.id ?? "template-default",
    coverImage:
      input.coverImage ??
      "https://picsum.photos/seed/litenote-new-note/960/720",
    isFavorite: false,
    isArchived: false,
    status: input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  };

  db.notes = [note, ...db.notes];
  await writeDatabase(db);
  return note;
};

export const updateNote = async (
  id: string,
  input: UpdateNoteInput,
): Promise<Note | null> => {
  const db = await readDatabase();
  const index = db.notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  const current = db.notes[index];
  const nextBody = input.body ?? current.body;
  const updated: Note = {
    ...current,
    ...input,
    title:
      input.title === undefined
        ? current.title
        : input.title.trim() || "Untitled entry",
    body: nextBody,
    summary: summarize(nextBody),
    tags: input.tags ?? current.tags,
    updatedAt: new Date().toISOString(),
  };

  db.notes[index] = updated;
  await writeDatabase(db);
  return updated;
};

export const toggleFavorite = async (id: string): Promise<Note | null> => {
  const db = await readDatabase();
  const index = db.notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  db.notes[index] = {
    ...db.notes[index],
    isFavorite: !db.notes[index].isFavorite,
    updatedAt: new Date().toISOString(),
  };

  await writeDatabase(db);
  return db.notes[index];
};

export const archiveNote = async (id: string): Promise<Note | null> => {
  return updateNote(id, { isArchived: true });
};
